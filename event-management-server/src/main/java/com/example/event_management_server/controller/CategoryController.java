package com.example.event_management_server.controller;

import com.example.event_management_server.model.Category;
import com.example.event_management_server.repository.CategoryRepository;
import com.example.event_management_server.repository.EventRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final EventRepository eventRepository;

    public CategoryController(CategoryRepository categoryRepository, EventRepository eventRepository) {
        this.categoryRepository = categoryRepository;
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getCategoryId(), c.getName(), c.getDescription()))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest req) {
        boolean exists = categoryRepository.findAll().stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(req.name()));
        if (exists) throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên danh mục đã tồn tại");

        Category category = new Category();
        category.setName(req.name().trim());
        category.setDescription(req.description());
        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CategoryResponse(saved.getCategoryId(), saved.getName(), saved.getDescription()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateCategory(@PathVariable Integer id, @Valid @RequestBody CategoryRequest req) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danh mục không tồn tại"));

        boolean nameConflict = categoryRepository.findAll().stream()
                .anyMatch(c -> c.getName().equalsIgnoreCase(req.name()) && !c.getCategoryId().equals(id));
        if (nameConflict) throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên danh mục đã tồn tại");

        category.setName(req.name().trim());
        category.setDescription(req.description());
        Category saved = categoryRepository.save(category);
        return new CategoryResponse(saved.getCategoryId(), saved.getName(), saved.getDescription());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danh mục không tồn tại"));

        long eventCount = eventRepository.countByCategory_CategoryId(id);
        if (eventCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa danh mục đang có " + eventCount + " sự kiện");
        }

        categoryRepository.delete(category);
        return ResponseEntity.ok(Map.of("message", "Đã xóa danh mục"));
    }

    record CategoryResponse(Integer categoryId, String name, String description) {}

    record CategoryRequest(
            @NotBlank(message = "Tên danh mục không được để trống")
            @Size(max = 100, message = "Tên tối đa 100 ký tự")
            String name,
            String description
    ) {}
}
