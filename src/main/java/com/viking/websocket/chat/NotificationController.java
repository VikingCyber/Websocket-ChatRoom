package com.viking.websocket.chat;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nl.martijndwars.webpush.Subscription;

@RestController
@RequestMapping("/api/push")
public class NotificationController {

  @Autowired
  private NotificationService notificationService;

  @GetMapping("/public-key")
  public String getPublicKey() {
    return notificationService.getPublicKey();
  }

  @PostMapping("/subscribe")
  public void subscribe(@RequestBody Subscription subscription) {
    notificationService.subscribe(subscription);
  }

  @PostMapping("/unsubscribe")
  public void unsubscribe(@RequestBody Map<String, String> body) {
    String endpoint = body.get("endpoint");
    notificationService.unsubscribe(endpoint);
  }

  @PostMapping("/broadcast")
  public ResponseEntity<Map<String, String>> broadcast(@RequestBody NotificationMessage message) {
    notificationService.broadcastNotification(message);
    Map<String, String> response = new HashMap<>();
    response.put("status", "OK");
    return ResponseEntity.ok(response);
  }
}