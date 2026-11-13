package com.scholarship.portal.controller;
import com.scholarship.portal.dto.ScholarshipRequest;import com.scholarship.portal.entity.Scholarship;import com.scholarship.portal.service.ScholarshipService;import jakarta.validation.Valid;import lombok.RequiredArgsConstructor;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class ScholarshipController {private final ScholarshipService service;
 @GetMapping("/scholarships/active") public List<Scholarship> active(){return service.active();}
 @GetMapping("/admin/scholarships") public List<Scholarship> all(){return service.all();}
 @PostMapping("/admin/scholarships") public ResponseEntity<Scholarship> create(@Valid @RequestBody ScholarshipRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));}
 @PutMapping("/admin/scholarships/{id}") public Scholarship update(@PathVariable Long id,@Valid @RequestBody ScholarshipRequest r){return service.update(id,r);}
}
