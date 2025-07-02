import { DataTypes } from 'sequelize';
import sequelize from './sequelize.js';

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: {
    type: DataTypes.ENUM('website', 'phone', 'walk-in', 'ad', 'referral'),
    allowNull: false,
  },
  vehicle_interest: DataTypes.STRING,
  trade_vehicle: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  last_lead_response_at: DataTypes.DATE,
  last_lead_response_channel: DataTypes.ENUM('email', 'text', 'phone'),
  last_staff_response_at: DataTypes.DATE,
  last_staff_response_channel: DataTypes.ENUM('email', 'text', 'phone'),
}, {
  tableName: 'leads',
  timestamps: false,
});

export default Lead;
