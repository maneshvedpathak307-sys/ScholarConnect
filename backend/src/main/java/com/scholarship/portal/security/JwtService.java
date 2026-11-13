package com.scholarship.portal.security;
import com.scholarship.portal.entity.User; import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service; import javax.crypto.SecretKey; import java.nio.charset.StandardCharsets; import java.util.Date;
@Service
public class JwtService {
 @Value("${app.jwt.secret}") private String secret; @Value("${app.jwt.expiration-ms}") private long expirationMs;
 private SecretKey key(){ return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }
 public String generateToken(User user){ Date now=new Date(); return Jwts.builder().subject(user.getEmail()).claim("role",user.getRole().name()).issuedAt(now).expiration(new Date(now.getTime()+expirationMs)).signWith(key()).compact(); }
 public String extractUsername(String token){ return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().getSubject(); }
 public boolean isValid(String token,User user){ try{return extractUsername(token).equals(user.getEmail());}catch(JwtException|IllegalArgumentException e){return false;} }
}
