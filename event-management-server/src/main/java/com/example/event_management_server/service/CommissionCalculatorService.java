package com.example.event_management_server.service;

import com.example.event_management_server.model.Commission;
import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.OrderCommission;
import com.example.event_management_server.repository.CommissionRepository;
import com.example.event_management_server.repository.OrderCommissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Tính và lưu hoa hồng (snapshot %) cho mỗi Order PAID.
 * Idempotent qua UNIQUE(order_id) trên bảng order_commissions.
 */
@Service
public class CommissionCalculatorService {

    private final CommissionRepository commissionRepository;
    private final OrderCommissionRepository orderCommissionRepository;

    public CommissionCalculatorService(CommissionRepository commissionRepository,
                                       OrderCommissionRepository orderCommissionRepository) {
        this.commissionRepository = commissionRepository;
        this.orderCommissionRepository = orderCommissionRepository;
    }

    @Transactional
    public void persistCommission(Order order) {
        if (orderCommissionRepository.existsByOrder_OrderId(order.getOrderId())) return;

        Commission active = commissionRepository.findFirstByIsActiveTrueOrderByEffectiveFromDesc()
                .orElse(null);
        BigDecimal percent = active != null ? active.getPercent() : BigDecimal.ZERO;

        BigDecimal gross = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal commissionAmount = gross.multiply(percent)
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(commissionAmount);

        Event event = order.getTicketReservation() != null
                && order.getTicketReservation().getTicketType() != null
                ? order.getTicketReservation().getTicketType().getEvent()
                : null;

        OrderCommission oc = new OrderCommission();
        oc.setOrder(order);
        oc.setEvent(event);
        oc.setOrganizer(event != null ? event.getOrganizer() : null);
        oc.setGrossAmount(gross);
        oc.setCommissionPercent(percent);
        oc.setCommissionAmount(commissionAmount);
        oc.setNetAmount(net);
        oc.setCommission(active);
        orderCommissionRepository.save(oc);
    }
}
