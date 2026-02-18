package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class V1__BackfillBookVersion extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        if (!bookTableExists(context)) {
            return;
        }

        try (PreparedStatement statement = context.getConnection()
                .prepareStatement("UPDATE book SET version = 0 WHERE version IS NULL")) {
            statement.executeUpdate();
        }
    }

    private boolean bookTableExists(Context context) throws Exception {
        try (PreparedStatement statement = context.getConnection().prepareStatement(
                "SELECT COUNT(1) FROM sqlite_master WHERE type = 'table' AND name = ?"
        )) {
            statement.setString(1, "book");
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() && resultSet.getInt(1) > 0;
            }
        }
    }
}
