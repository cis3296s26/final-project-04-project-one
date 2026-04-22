package com.backend.crazy8s;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Server pushes messages to clients on destinations prefixed with /topic
        config.enableSimpleBroker("/topic");
        // Client messages sent to /app/... are routed to @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override 
    // WebSocket connection endpoint, only accepts connections from the frontend
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
