package com.viking.websocket.chat;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    @Autowired
    private RoomService roomService;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private final Map<String, List<String>> activeRooms = new ConcurrentHashMap<>();

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage message, SimpMessageHeaderAccessor accessor) {
        System.out.println("addUser: " + message.getSender());
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            sessionAttributes.put("username", message.getSender());
        } else {
            System.out.println("Warning: Session attributes are null for user: " + message.getSender());
        }

        String room = message.getRoom();
        activeRooms.computeIfAbsent(room, k -> new ArrayList<>()).add(message.getSender());

        if (MessageType.JOIN.equals(message.getType())) {
            simpMessagingTemplate.convertAndSend("/topic/public/" + room, message);
        }
    }

    @MessageMapping("/chat/leaveUser")
    public void leaveUser(@Payload ChatMessage message, SimpMessageHeaderAccessor accessor) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            String username = (String) sessionAttributes.get("username");
            String room = message.getRoom();

            if (username != null && activeRooms.containsKey(room)) {
                activeRooms.get(room).remove(username);

                ChatMessage leaveMessage = ChatMessage.builder()
                        .sender(username)
                        .room(room)
                        .type(MessageType.LEAVE)
                        .build();

                simpMessagingTemplate.convertAndSend("/topic/public/" + room, leaveMessage);
            }
        } else {
            System.out.println("Warning: Session attributes are null for LEAVE event");
        }
    }

    @MessageMapping("/chat.createRoom")
    public void createRoom(String roomName) {
        if (!roomService.doesRoomExist(roomName)) {
            roomService.createRoom(roomName);
            activeRooms.put(roomName, new ArrayList<>());
            simpMessagingTemplate.convertAndSend("/topic/rooms", roomService.getAllRooms());
        } else {
            System.out.println("Room already exists!");
        }
    }

    @MessageMapping("/chat.sendMessage/{roomName}")
    @SendTo("/topic/public/{roomName}")
    public ChatMessage sendMessage(@DestinationVariable String roomName, @Payload ChatMessage message) {
        return message;
    }

    @MessageMapping("/chat.getRooms")
    public void getRooms() {
        simpMessagingTemplate.convertAndSend("/topic/rooms", roomService.getAllRooms());
    }
}
