package com.scholarship.portal.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;
@Entity @Table(name="application_reviews") @Getter @Setter @NoArgsConstructor
public class ApplicationReview {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="application_id") private ScholarshipApplication application;
 @ManyToOne(optional=false) @JoinColumn(name="admin_id") private User admin;
 @Column(nullable=false) private String action; @Column(length=2000) private String remarks; private LocalDateTime reviewedAt=LocalDateTime.now();
}
