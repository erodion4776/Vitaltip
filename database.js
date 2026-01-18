const { Sequelize, DataTypes, Model } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

class League extends Model {}
League.init({
  name: DataTypes.STRING,
  country: DataTypes.STRING,
  logo_url: DataTypes.STRING,
  slug: DataTypes.STRING
}, { sequelize, modelName: 'League' });

class Team extends Model {}
Team.init({
  name: DataTypes.STRING,
  logo_url: DataTypes.STRING
}, { sequelize, modelName: 'Team' });

class Match extends Model {}
Match.init({
  match_date: DataTypes.DATE,
  status: { type: DataTypes.STRING, defaultValue: 'upcoming' },
  home_form: DataTypes.STRING,
  away_form: DataTypes.STRING,
  head_to_head_text: DataTypes.TEXT,
  analysis_content: DataTypes.TEXT,
  prediction_main: DataTypes.STRING,
  prediction_confidence: DataTypes.INTEGER,
  affiliate_link: DataTypes.STRING,
  result_score: DataTypes.STRING,
  slug: DataTypes.STRING
}, { sequelize, modelName: 'Match' });

class Admin extends Model {}
Admin.init({
  username: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING
}, { sequelize, modelName: 'Admin' });

Match.belongsTo(Team, { as: 'HomeTeam', foreignKey: 'home_team_id' });
Match.belongsTo(Team, { as: 'AwayTeam', foreignKey: 'away_team_id' });
Match.belongsTo(League, { foreignKey: 'league_id' });

module.exports = { sequelize, League, Team, Match, Admin };
