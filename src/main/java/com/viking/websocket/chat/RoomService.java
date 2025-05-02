package com.viking.websocket.chat;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class RoomService {
  private final List<String> rooms = new ArrayList<>();

  public void createRoom(String roomName) {
    if (!rooms.contains(roomName)) {
      rooms.add(roomName);
    }
  }

  public boolean doesRoomExist(String roomName) {
    return rooms.contains(roomName);
  }

  public List<String> getAllRooms() {
    return rooms;
  }
}