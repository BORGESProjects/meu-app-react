package com.apaprovado;

import java.sql.Connection;
import java.sql.Statement;
import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SqlInitializationTests {
    @Test void preservesPostgresBlocksInProductionInitialization() throws Exception {
        var properties = new Properties();
        try (var input = new ClassPathResource("application-prod.properties").getInputStream()) {
            properties.load(input);
        }
        var separator = properties.getProperty("spring.sql.init.separator");
        assertEquals(ScriptUtils.EOF_STATEMENT_SEPARATOR, separator);
        var connection = mock(Connection.class);
        var statement = mock(Statement.class);
        when(statement.getUpdateCount()).thenReturn(-1);
        when(connection.createStatement()).thenReturn(statement);
        var populator = new ResourceDatabasePopulator();
        populator.setSeparator(separator);
        populator.addScript(new ClassPathResource("acervo-security.sql"));
        populator.populate(connection);
        var sql = ArgumentCaptor.forClass(String.class);
        verify(statement, times(1)).execute(sql.capture());
        assertTrue(sql.getValue().contains("END IF; END $$;"));
        assertEquals(2, sql.getValue().split("DO \\$\\$", -1).length - 1);
        assertTrue(sql.getValue().contains("WITH CHECK ((SELECT auth.uid()) = user_id)"));
    }
}
