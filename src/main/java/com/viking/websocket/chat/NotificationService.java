package com.viking.websocket.chat;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jose4j.lang.JoseException;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;

@Service
public class NotificationService {

  Dotenv dotenv = Dotenv.load();

  private final String publicKey = dotenv.get("VAPID_PUBLIC_KEY");
  private final String privateKey = dotenv.get("VAPID_PRIVATE_KEY");

  private PushService pushService;

  private List<Subscription> subscriptions = new CopyOnWriteArrayList<>();

  @PostConstruct
  public void init() throws GeneralSecurityException {
    Security.addProvider(new BouncyCastleProvider());
    pushService = new PushService(publicKey, privateKey);
  }

  public String getPublicKey() {
    return publicKey;
  }

  public void subscribe(Subscription subscription) {
    System.out.println("Subscribed: " + subscription.endpoint);
    this.subscriptions.add(subscription);
  }

  public void unsubscribe(String endpoint) {
    System.out.println("Unsubscribed: " + endpoint);
    subscriptions = subscriptions.stream().filter(s -> !endpoint.equals(s.endpoint))
        .collect(Collectors.toList());
  }

  public void sendNotification(Subscription subscription, String payload) {
    try {
      pushService.send(new Notification(subscription, payload));
    } catch (GeneralSecurityException | IOException | JoseException | ExecutionException | InterruptedException e) {
      e.printStackTrace();
    }
  }

  public void broadcastNotification(NotificationMessage message) {
    if (!"CHAT".equals(message.getCategory())) {
      return; // игнорируем все, кроме категории CHAT
    }

    ObjectMapper objectMapper = new ObjectMapper();
    for (Subscription subscription : subscriptions) {
      try {
        String payload = objectMapper.writeValueAsString(message);
        Notification notification = new Notification(subscription, payload);
        pushService.send(notification);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
}
