package org.bbyriny.backend.config;

import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.bbyriny.backend.dto.DragonEvent;
import org.bbyriny.backend.dto.HelperEvent;

@Component
public class ChangeListener {
    private final SimpMessagingTemplate messagingTemplate;

    public ChangeListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDragonEvent(DragonEvent event) {
        messagingTemplate.convertAndSend("/topic/dragons", event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleHelperEvent(HelperEvent event) {
        messagingTemplate.convertAndSend("/topic/helpers", event);
    }
}
