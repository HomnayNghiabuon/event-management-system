package com.event.management.server.service;

import com.event.management.server.dto.ReservationRequestDTO;
import com.event.management.server.entity.*;
import com.event.management.server.exception.BadRequestException;
import com.event.management.server.exception.NotFoundException;
import com.event.management.server.repository.TicketReservationRepository;
import com.event.management.server.repository.TicketTypeRepository;
import com.event.management.server.repository.UserRepository; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {

    private final TicketTypeRepository ticketTypeRepository;
    private final TicketReservationRepository reservationRepository;
    private final UserRepository userRepository; 


    public ReservationService(TicketTypeRepository ticketTypeRepository, 
                              TicketReservationRepository reservationRepository, 
                              UserRepository userRepository) {
        this.ticketTypeRepository = ticketTypeRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public TicketReservation createReservation(ReservationRequestDTO request) {

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người dùng!"));

        TicketType ticketType = ticketTypeRepository
                .findByIdForUpdate(request.getTicketTypeId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy loại vé"));

        if (ticketType.getQuantity() < request.getQuantity()) {
            throw new BadRequestException("Không đủ vé trong kho");
        }

        ticketType.setQuantity(
                ticketType.getQuantity() - request.getQuantity()
        );

        TicketReservation reservation = new TicketReservation.ReservationBuilder()
                .user(user)
                .ticketType(ticketType)
                .quantity(request.getQuantity())
                .build();
        
        return reservationRepository.save(reservation);
    }
}