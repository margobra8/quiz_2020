const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { models } = require("../models");

const paginate = require("../helpers/paginate").paginate;

// Autoload el quiz asociado a :quizId
exports.load = async (req, res, next, groupId) => {
  try {
    const group = await models.Group.findByPk(groupId);
    if (group) {
      req.load = { ...req.load, group };
      next();
    } else {
      throw new Error("There is no group with id=" + groupId);
    }
  } catch (error) {
    next(error);
  }
};

// GET /groups
exports.index = async (req, res, next) => {
  try {
    const groups = await models.Group.findAll();
    res.render("groups/index.ejs", {
      groups,
    });
  } catch (error) {
    next(error);
  }
};

exports.new = (req, res, next) => {
  const group = { name: "" };
  res.render("groups/new.ejs", { group });
};

// POST /groups/create
exports.create = async (req, res, next) => {
  const { name } = req.body;

  let group = models.Group.build({
    name,
  });

  try {
    // Saves only the fields question and answer into the DDBB
    group = await group.save({ fields: ["name"] });
    req.flash("success", "Group created successfully.");
    res.redirect("groups");
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash("error", "There are errors in the form:");
      error.errors.forEach(({ message }) => req.flash("error", message));
      res.render("groups/new", { group });
    } else {
      req.flash("error", "Error creating a new Group: " + error.message);
      next(error);
    }
  }
};

exports.edit = async (req, res, next) => {
  const { group } = req.load;
  const allQuizzes = await models.Quiz.findAll();
  const groupQuizzesIds = await group.getQuizzes().map((quiz) => quiz.id);
  res.render("groups/edit", { group, allQuizzes, groupQuizzesIds });
};

// POST /groups/create
exports.update = async (req, res, next) => {
  let { group } = req.load;

  const { name, quizzesIds = [] } = req.body;

  group.name = name.trim();

  try {
    // Saves only the fields question and answer into the DDBB
    group = await group.save({ fields: ["name"] });
    await group.setQuizzes(quizzesIds);
    req.flash("success", "Group updated successfully.");
    res.redirect("/groups");
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash("error", "There are errors in the form:");
      error.errors.forEach(({ message }) => req.flash("error", message));
      const allQuizzes = await models.Quiz.findAll();
      res.render("groups/edit", {
        group,
        allQuizzes,
        groupQuizzesIds: quizzesIds,
      });
    } else {
      req.flash("error", "Error updating a group: " + error.message);
      next(error);
    }
  }
};

// DELETE /groups/:quizId
exports.destroy = async (req, res, next) => {
  try {
    await req.load.group.destroy();
    req.flash("success", "Group deleted successfully.");
    res.redirect("/groups");
  } catch (error) {
    req.flash("error", "Error deleting the Group: " + error.message);
    next(error);
  }
};

exports.randomPlay = async (req, res, next) => {
  const curGroup = req.load.group;
  try {
    req.session.groupsRandomPlay = req.session.groupsRandomPlay || {};
    req.session.groupsRandomPlay[curGroup.id] = req.session.groupsRandomPlay[
      curGroup.id
    ] || {
      resolved: [],
      lastQuizId: 0,
    };

    let quiz;
    if (req.session.groupsRandomPlay[curGroup.id].lastQuizId) {
      quiz = await models.Quiz.findByPk(
        req.session.groupsRandomPlay[curGroup.id].lastQuizId
      );
    } else {
      const total = await curGroup.countQuizzes();
      const quedan =
        total - req.session.groupsRandomPlay[curGroup.id].resolved.length;

      quiz = await models.Quiz.findOne({
        where: {
          id: {
            [Sequelize.Op.notIn]:
              req.session.groupsRandomPlay[curGroup.id].resolved,
          },
        },
        include: [
          { model: models.Group, as: "groups", where: { id: curGroup.id } },
        ],
        offset: Math.floor(Math.random() * quedan),
      });
    }
    const score = req.session.groupsRandomPlay[curGroup.id].resolved.length;
    if (quiz) {
      req.session.groupsRandomPlay[curGroup.id].lastQuizId = quiz.id;
      res.render("groups/random_play", { group: curGroup, quiz, score });
    } else {
      delete req.session.groupsRandomPlay[curGroup.id];
      res.render("groups/random_nomore", { group: curGroup, score });
    }
  } catch (error) {
    next(error);
  }
};

exports.randomCheck = async (req, res, next) => {
  const curGroup = req.load.group;
  try {
    req.session.groupsRandomPlay = req.session.groupsRandomPlay || {};
    req.session.groupsRandomPlay[curGroup.id] = req.session.groupsRandomPlay[
      curGroup.id
    ] || {
      resolved: [],
      lastQuizId: 0,
    };

    const answer = req.query.answer || "";
    const result =
      answer.toLowerCase().trim() === req.load.quiz.answer.toLowerCase().trim();

    if (result) {
      req.session.groupsRandomPlay[curGroup.id].lastQuizId = 0;
      if (
        req.session.groupsRandomPlay[curGroup.id].resolved.indexOf(
          req.load.quiz.id
        ) === -1
      ) {
        req.session.groupsRandomPlay[curGroup.id].resolved.push(
          req.load.quiz.id
        );
      }

      const score = req.session.groupsRandomPlay[curGroup.id].resolved.length;

      res.render("groups/random_result", {
        group: curGroup,
        result,
        answer,
        score,
      });
    } else {
      const score = req.session.groupsRandomPlay[curGroup.id].resolved.length;
      delete req.session.groupsRandomPlay[curGroup.id];
      res.render("groups/random_result", {
        group: curGroup,
        result,
        answer,
        score,
      });
    }
  } catch (error) {
    next(error);
  }
};
