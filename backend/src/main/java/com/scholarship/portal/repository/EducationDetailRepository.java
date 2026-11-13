package com.scholarship.portal.repository;
import com.scholarship.portal.entity.EducationDetail; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface EducationDetailRepository extends JpaRepository<EducationDetail,Long>{ List<EducationDetail> findByApplicationId(Long applicationId); }
