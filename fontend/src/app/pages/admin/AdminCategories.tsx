import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Category {
  id: string;
  name: string;
  eventCount: number;
}

interface ApprovedEvent {
  id: string;
  title: string;
  category: string;
  organizer: string;
  showOnHome: boolean;
}

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Live Concert', eventCount: 24 },
  { id: 'cat-2', name: 'Workshop', eventCount: 15 },
  { id: 'cat-3', name: 'Fan Meeting', eventCount: 8 },
  { id: 'cat-4', name: 'Hội thảo', eventCount: 12 },
];

const initialEvents: ApprovedEvent[] = [
  { id: 'evt-101', title: 'Lễ Hội Âm Nhạc Mùa Hè 2026', category: 'Live Concert', organizer: 'Vienam Entertainment', showOnHome: true },
  { id: 'evt-102', title: 'Đêm Nhạc K-Pop: Dream Concert', category: 'Live Concert', organizer: 'K-Pop Star', showOnHome: true },
  { id: 'evt-103', title: 'Hội Thảo Digital Marketing', category: 'Workshop', organizer: 'MarketingHub', showOnHome: false },
  { id: 'evt-104', title: 'Fan Meeting: Sơn Tùng M-TP', category: 'Fan Meeting', organizer: 'M-TP Entertainment', showOnHome: true },
  { id: 'evt-105', title: 'Hội Thảo Công Nghệ AI 2026', category: 'Hội thảo', organizer: 'TechAsia', showOnHome: false },
  { id: 'evt-106', title: 'Hội Thảo Digital Marketing 2026', category: 'Workshop', organizer: 'MarketingVietnam Co.', showOnHome: false }, // Newly approved event
];

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [events, setEvents] = useState<ApprovedEvent[]>(initialEvents);
  
  // Category Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Category Actions
  const handleSaveAdd = () => {
    if (newName.trim() === '') return;
    setCategories([...categories, { id: `cat-${Date.now()}`, name: newName, eventCount: 0 }]);
    setNewName('');
    setIsAdding(false);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim() === '') return;
    setCategories(categories.map(c => c.id === id ? { ...c, name: editName } : c));
    setIsEditing(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCategories(categories.filter(c => c.id !== deleteId));
    setDeleteId(null);
  };

  // Event Mapping Actions
  const toggleShowOnHome = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, showOnHome: !e.showOnHome } : e));
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Quản lý danh mục</h1>
          <p className="text-gray-500 font-medium">Tạo danh mục mới và gán sự kiện hiển thị lên trang chủ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Category CRUD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Danh sách danh mục</h2>
              <button 
                onClick={() => setIsAdding(true)}
                className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                disabled={isAdding}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 sm:p-6">
              <ul className="space-y-3">
                {/* Add New Input */}
                <AnimatePresence>
                  {isAdding && (
                    <motion.li 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                    >
                      <input 
                        autoFocus
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-white border border-blue-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 font-medium text-sm text-gray-800"
                        placeholder="Tên danh mục mới..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveAdd()}
                      />
                      <button onClick={handleSaveAdd} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setIsAdding(false); setNewName(''); }} className="p-2 text-gray-400 hover:bg-white rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.li>
                  )}
                </AnimatePresence>

                {/* Category List */}
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors group shadow-sm">
                    {isEditing === category.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input 
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-white border border-blue-300 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-sm text-gray-800"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(category.id)}
                        />
                        <button onClick={() => handleSaveEdit(category.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditing(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-bold text-gray-800">{category.name}</span>
                          <span className="ml-2 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{category.eventCount} sự kiện</span>
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <button 
                            onClick={() => { setIsEditing(category.id); setEditName(category.name); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteId(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Event Mapping */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gán sự kiện hiển thị Homepage</h2>
                <p className="text-sm text-gray-500 font-medium">Chỉ các sự kiện được đánh dấu mới hiển thị lên trang chủ</p>
              </div>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
                  placeholder="Tìm sự kiện đã duyệt..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                      Hiển thị
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sự kiện</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Người tạo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEvents.map((event) => (
                    <tr 
                      key={event.id} 
                      className={`transition-colors cursor-pointer ${event.showOnHome ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}
                      onClick={() => toggleShowOnHome(event.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            checked={event.showOnHome}
                            onChange={() => toggleShowOnHome(event.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 sm:hidden">{event.organizer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg bg-gray-100 text-gray-700">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 hidden sm:table-cell">
                        {event.organizer}
                      </td>
                    </tr>
                  ))}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-medium">
                        Không tìm thấy sự kiện nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-blue-50 border-t border-blue-100 text-sm text-blue-800 flex items-start gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p>Chỉ những sự kiện có trạng thái <strong>"Đã duyệt"</strong> mới xuất hiện trong danh sách này. Sự kiện được check sẽ ưu tiên hiển thị ở trang chủ cho người mua vé.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa danh mục?</h3>
              <p className="text-gray-500 font-medium mb-6">Bạn có chắc chắn muốn xóa danh mục này? Các sự kiện thuộc danh mục này có thể bị ảnh hưởng.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 hover:shadow-md transition-all"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}