const path = require('path');

// Load ORM
const Sequelize = require('sequelize');


// Environment variable to define the URL of the data base to use.
// To use SQLite data base:
//    DATABASE_URL = sqlite:quiz.sqlite
const url = process.env.DATABASE_URL || "sqlite:quiz.sqlite";

const sequelize = new Sequelize(url);

// Import the definition of the Quiz Table from quiz.js
const Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// Import the definition of the Users Table from user.js
const User = sequelize.import(path.join(__dirname,'user'));

// Import the definition of the Group Table from group.js
const Group = sequelize.import(path.join(__dirname,'group'));

// Session
sequelize.import(path.join(__dirname,'session'));


// Relation 1-to-N between User and Quiz:
User.hasMany(Quiz, {as: 'quizzes', foreignKey: 'authorId'});
Quiz.belongsTo(User, {as: 'author', foreignKey: 'authorId'});

Quiz.belongsToMany(Group, {
    as: "groups",
    through: "GroupQuizzes",
    foreignKey: "quizId",
    otherKey: "groupId"
});

Group.belongsToMany(Quiz, {
    as: "quizzes",
    through: "GroupQuizzes",
    foreignKey: "groupId",
    otherKey: "quizId"
});

module.exports = sequelize;
