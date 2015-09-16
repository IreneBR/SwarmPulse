package ch.ethz.coss.nervous.pulse.sql;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import ch.ethz.coss.nervous.pulse.Configuration;
import ch.ethz.coss.nervous.pulse.utils.Log;

public class SqlSetup {

	public static final int TYPE_BOOL = 0;
	public static final int TYPE_INT32 = 1;
	public static final int TYPE_INT64 = 2;
	public static final int TYPE_FLOAT = 3;
	public static final int TYPE_DOUBLE = 4;
	public static final int TYPE_STRING = 5;
	public static final int TYPE_LOCATION = 6;

	private Connection con;
	private Configuration config;
	private HashMap<Long, List<Integer>> elementsHash;

	public SqlSetup(Connection con, Configuration config) {
		this.con = con;
		this.config = config;
		// Hash for performance reasons when asking for insert statements
		this.elementsHash = new HashMap<Long, List<Integer>>();
	}

	public void setupTables() {
		// setupTransactionTable();
		setupPulseTables();
	}

	public PreparedStatement getTransactionInsertStatement(Connection con)
			throws SQLException {
		return con
				.prepareStatement("INSERT INTO `Transact` (`UUID`, `UploadTime`) VALUES (?,?);");
	}

	public List<Integer> getArgumentExpectation(long sensorId) {
		return elementsHash.get(sensorId);
	}

	public PreparedStatement getSensorInsertStatement(Connection con,
			long sensorId) throws SQLException {
		List<Integer> types = elementsHash.get(sensorId);
		if (types != null) {
			StringBuilder sb = new StringBuilder();
			sb.append("INSERT INTO `ELEMENT_" + Long.toHexString(sensorId)
					+ "` VALUES (DEFAULT,?,?,");
			for (int i = 0; i < types.size() - 1; i++) {
				sb.append("?,");
			}
			if (types.size() >= 1) {
				sb.append("?");
			}
			sb.append(");");
			return con.prepareStatement(sb.toString());
		} else {
			return null;
		}
	}

	private void setupPulseTables() {
		for (PulseElementConfiguration element : config.getSensors()) {

			System.out.println("SetUpPulseTables config.getSensor() size = "
					+ config.getSensors().size());
			List<Integer> types = new ArrayList<Integer>(element
					.getAttributes().size());
			StringBuilder sb = new StringBuilder();
			if (element == null)
				System.out.println("Element is null");
			else
				System.out.println("Element is not null "
						+ element.getElementID());

			sb.append("CREATE TABLE IF NOT EXISTS `" + config.getSqlDatabase()
					+ "`.`ELEMENT_" + Long.toHexString(element.getElementID())
					+ "` (\n");
			sb.append("`RecordID` INT NOT NULL UNIQUE AUTO_INCREMENT,\n");
			sb.append("`UUID` BINARY(16) NOT NULL,\n");
			sb.append("`RecordTime` BIGINT UNSIGNED NOT NULL,\n");
			for (PulseElementAttribute attribute : element.getAttributes()) {
				types.add(attribute.getType());
				String sqlType = "";
				switch (attribute.getType()) {
				case TYPE_BOOL:
					sqlType = "BIT";
					break;
				case TYPE_INT32:
					sqlType = "INT";
					break;
				case TYPE_INT64:
					sqlType = "BIGINT";
					break;
				case TYPE_FLOAT:
					sqlType = "FLOAT";
					break;
				case TYPE_DOUBLE:
					sqlType = "FLOAT";
					break;
				case TYPE_STRING:
					sqlType = "VARCHAR(255)";
					break;

				case TYPE_LOCATION:
					sqlType = "GEOGRAPHY";
					break;

				default:
					sqlType = "VARCHAR(255)";
					break;
				}
				sb.append("`" + attribute.getName() + "` " + sqlType
						+ " NOT NULL,\n");
			}
			sb.append("PRIMARY KEY (`RecordID`));");
			try {
				String command = sb.toString();
				System.out.println("SQL STATEMENT : " + command);
				Statement stmt = con.createStatement();
				stmt.execute(command);
				stmt.close();
			} catch (SQLException e) {
				e.printStackTrace();
				Log.getInstance().append(
						Log.FLAG_ERROR,
						"Error setting up a sensor table ("
								+ element.getElementName()
								+ ") with SQL statement : (" + sb.toString()
								+ ")");
			}
			// sb = new StringBuilder();
			// sb.append("CREATE INDEX `idx_ELEMENT_"
			// + Long.toHexString(element.getElementID()) + "_UUID` ON `"
			// + config.getSqlDatabase() + "`.`ELEMENT_"
			// + Long.toHexString(element.getElementID()) + "` (`UUID`);");
			// try {
			// String command = sb.toString();
			// Statement stmt = con.createStatement();
			// stmt.execute(command);
			// stmt.close();
			// } catch (SQLException e) {
			// e.printStackTrace();
			// Log.getInstance().append(
			// Log.FLAG_WARNING,
			// "SQL Error setting up a sensor table ("
			// + element.getElementName()
			// + ") index. Index might already exist.  SQL statement : ("+
			// sb.toString()+")");
			// } catch (Exception e) {
			// e.printStackTrace();
			// Log.getInstance().append(
			// Log.FLAG_WARNING,
			// "General Exception setting up a sensor table ("
			// + element.getElementName()
			// + ") with SQL statement : ("+ sb.toString()+")");
			// }
			// sb = new StringBuilder();
			// sb.append("CREATE INDEX `idx_ELEMENT_"
			// + Long.toHexString(element.getElementID())
			// + "_RecordTime` ON `" + config.getSqlDatabase()
			// + "`.`ELEMENT_" + Long.toHexString(element.getElementID())
			// + "` (`RecordTime`);");
			// try {
			// String command = sb.toString();
			// Statement stmt = con.createStatement();
			// stmt.execute(command);
			// stmt.close();
			// } catch (SQLException e) {
			// Log.getInstance().append(
			// Log.FLAG_WARNING,
			// "Error setting up a elements table ("
			// + element.getElementName()
			// + ") index. Index might already exist.");
			// }
			elementsHash.put(element.getElementID(), types);
		}
	}

	private void setupTransactionTable() {
		StringBuilder sb = new StringBuilder();
		sb.append("CREATE TABLE IF NOT EXISTS `" + config.getSqlDatabase()
				+ "`.`Transact` (\n");
		sb.append("`RecordID` INT NOT NULL UNIQUE AUTO_INCREMENT,\n");
		sb.append("`UUID` BINARY(16) NOT NULL,\n");
		sb.append("`UploadTime` BIGINT UNSIGNED NOT NULL,\n");
		sb.append("PRIMARY KEY (`RecordID`));\n");
		try {
			String command = sb.toString();
			Statement stmt = con.createStatement();
			stmt.execute(command);
			stmt.close();
		} catch (SQLException e) {
			Log.getInstance().append(Log.FLAG_ERROR,
					"Error setting up the transaction table");
		}
		sb = new StringBuilder();
		sb.append("CREATE INDEX `idx_Transact_UUID` ON `"
				+ config.getSqlDatabase() + "`.`Transact` (`UUID`);\n");
		try {
			String command = sb.toString();
			Statement stmt = con.createStatement();
			stmt.execute(command);
			stmt.close();
		} catch (SQLException e) {
			Log.getInstance()
					.append(Log.FLAG_WARNING,
							"Error setting up the transaction table index. Index might already exist.");
		}
		sb = new StringBuilder();
		sb.append("CREATE INDEX `idx_Transact_UploadTime` ON `"
				+ config.getSqlDatabase() + "`.`Transact` (`UploadTime`);");
		try {
			String command = sb.toString();
			Statement stmt = con.createStatement();
			stmt.execute(command);
			stmt.close();
		} catch (SQLException e) {
			Log.getInstance()
					.append(Log.FLAG_WARNING,
							"Error setting up the transaction table index. Index might already exist.");
		}
	}

}
