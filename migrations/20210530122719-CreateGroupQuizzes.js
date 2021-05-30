'use strict';

module.exports = {
    up(queryInterface, Sequelize) {
        return queryInterface.createTable(
            'GroupQuizzes',
            {
                quizId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    unique: "compositeKey",
                    references: {
                      model: "Quizzes",
                      key: "id"
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE"
                },
                groupId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    unique: "compositeKey",
                    references: {
                      model: "Groups",
                      key: "id"
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE"
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },
    down(queryInterface, Sequelize) {
        return queryInterface.dropTable('GroupQuizzes');
    }
};

