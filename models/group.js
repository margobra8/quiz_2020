const { Model } = require("sequelize");

// Definition of the Quiz model:

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {}

  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        validate: { notEmpty: { msg: "Group name must not be empty" } },
      },
    },
    {
      sequelize,
    }
  );

  return Group;
};
