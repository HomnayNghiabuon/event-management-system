package com.example.event_management_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class EventManagementServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventManagementServerApplication.class, args);
	}

}
