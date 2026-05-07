package com.example.event_management_server.repository;

import com.example.event_management_server.model.PaymentMethod;
import com.example.event_management_server.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Integer> {

    Optional<PaymentTransaction> findByProviderAndProviderTxnRef(PaymentMethod provider, String providerTxnRef);

    List<PaymentTransaction> findByOrder_OrderIdOrderByCreatedAtDesc(Integer orderId);
}
