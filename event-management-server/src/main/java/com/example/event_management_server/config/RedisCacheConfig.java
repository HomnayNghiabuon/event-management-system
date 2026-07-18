package com.example.event_management_server.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

import java.time.Duration;

/**
 * Cấu hình Redis cache cho toàn hệ thống.
 *
 * Cache hiện có:
 * - {@link #CACHE_CATEGORIES}: danh sách danh mục (ít thay đổi) — TTL 1 giờ,
 *   evict khi Admin thêm/sửa/xóa danh mục.
 * - {@link #CACHE_EVENT_DETAIL}: chi tiết sự kiện public (GET /events/{id} không đăng nhập) —
 *   TTL 60s vì payload chứa số lượng vé (thay đổi khi bán); evict khi organizer
 *   update/publish/delete hoặc admin duyệt sự kiện.
 *
 * Nếu Redis không chạy: CacheErrorHandler nuốt lỗi kết nối và fallback về DB,
 * app vẫn hoạt động bình thường (chỉ log warning). Có thể tắt hẳn cache bằng
 * biến môi trường CACHE_TYPE=none.
 */
@Configuration
@EnableCaching
public class RedisCacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheConfig.class);

    public static final String CACHE_CATEGORIES = "categories";
    public static final String CACHE_EVENT_DETAIL = "event-detail";

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        // ObjectMapper riêng cho cache: hỗ trợ java.time + ghi kèm @class
        // để deserialize đúng kiểu record (EventResponse, CategoryResponse, ...)
        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY);

        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .prefixCacheNameWith("eventms::")
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer(mapper)))
                .entryTtl(Duration.ofMinutes(10));

        return builder -> builder
                .cacheDefaults(defaults)
                .withCacheConfiguration(CACHE_CATEGORIES, defaults.entryTtl(Duration.ofHours(1)))
                .withCacheConfiguration(CACHE_EVENT_DETAIL, defaults.entryTtl(Duration.ofSeconds(60)));
    }

    /** Redis lỗi/không chạy → coi như cache miss, không ném exception ra ngoài. */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException e, Cache cache, Object key) {
                log.warn("Redis GET lỗi (cache={}, key={}): {} — fallback về DB", cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException e, Cache cache, Object key, Object value) {
                log.warn("Redis PUT lỗi (cache={}, key={}): {}", cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException e, Cache cache, Object key) {
                log.warn("Redis EVICT lỗi (cache={}, key={}): {}", cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException e, Cache cache) {
                log.warn("Redis CLEAR lỗi (cache={}): {}", cache.getName(), e.getMessage());
            }
        };
    }
}
