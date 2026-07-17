package com.juanbenevento.ledger;

import org.junit.jupiter.api.Test;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Test to verify the multi-module Maven structure.
 * This test will fail until the parent POM and modules are created.
 */
class MavenStructureTest {

    @Test
    void shouldHaveParentPomAtRoot() {
        // Given
        Path projectRoot = Paths.get(System.getProperty("user.dir")).getParent();
        Path parentPom = projectRoot.resolve("pom.xml");
        
        // When & Then
        assertTrue(Files.exists(parentPom), "Parent POM should exist at project root");
    }

    @Test
    void parentPomShouldHaveAllModules() throws Exception {
        // Given
        Path projectRoot = Paths.get(System.getProperty("user.dir")).getParent();
        Path parentPom = projectRoot.resolve("pom.xml");
        
        // When
        String content = new String(Files.readAllBytes(parentPom));
        
        // Then
        assertTrue(content.contains("<module>ledger-engine-domain</module>"), 
                "Parent POM should include ledger-engine-domain module");
        assertTrue(content.contains("<module>ledger-engine-application</module>"), 
                "Parent POM should include ledger-engine-application module");
        assertTrue(content.contains("<module>ledger-engine-infrastructure</module>"), 
                "Parent POM should include ledger-engine-infrastructure module");
        assertTrue(content.contains("<module>ledger-engine-api</module>"), 
                "Parent POM should include ledger-engine-api module");
        assertTrue(content.contains("<module>ledger-engine-security</module>"), 
                "Parent POM should include ledger-engine-security module");
        assertTrue(content.contains("<module>ledger-engine-test</module>"), 
                "Parent POM should include ledger-engine-test module");
    }

    @Test
    void eachModuleShouldHavePomXml() {
        // Given
        Path projectRoot = Paths.get(System.getProperty("user.dir")).getParent();
        String[] modules = {
            "ledger-engine-domain",
            "ledger-engine-application", 
            "ledger-engine-infrastructure",
            "ledger-engine-api",
            "ledger-engine-security",
            "ledger-engine-test"
        };
        
        // When & Then
        for (String module : modules) {
            Path modulePom = projectRoot.resolve(module).resolve("pom.xml");
            assertTrue(Files.exists(modulePom), 
                    "Module " + module + " should have its own pom.xml");
        }
    }

    @Test
    void domainModuleShouldHaveZeroSpringDependencies() throws Exception {
        // Given
        Path projectRoot = Paths.get(System.getProperty("user.dir")).getParent();
        Path domainPom = projectRoot.resolve("ledger-engine-domain").resolve("pom.xml");
        
        // When
        String content = new String(Files.readAllBytes(domainPom));
        
        // Then
        assertFalse(content.contains("spring-boot-starter"), 
                "Domain module should NOT have Spring Boot dependencies");
        assertFalse(content.contains("spring-framework"), 
                "Domain module should NOT have Spring Framework dependencies");
    }
}