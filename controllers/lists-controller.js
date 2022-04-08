const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const List = require("../models/list");
const User = require("../models/user");
const mongoose = require("mongoose");

const getLists = async (req, res, next) => {
  let userWithLists;
  try {
    userWithLists = await User.findById(req.userData.userId).populate("lists");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. Please try again later",
      500
    );

    return next(error);
  }

  if (!userWithLists) {
    const error = new HttpError(
      "Could not find lists for the provided user id.",
      404
    );
    return next(error);
  }

  if (userWithLists.lists.length === 0) {
    return res.json({ lists: [] });
  }

  res.json({
    lists: userWithLists.lists.map((list) => list.toObject({ getters: true })),
  });
};

const getList = async (req, res, next) => {
  const listId = req.params.listId;

  let list;
  try {
    list = await List.findById(listId).exec();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a list",
      500
    );
    return next();
  }

  if (!list) {
    const error = new HttpError(
      "Could not find a list with id: " + listId,
      404
    );
    return next(error);
  }

  if (list.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized, to get this list",
      403
    );
    return next(error);
  }

  res.json({ list: list.toObject({ getters: true }) });
};

const createList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Please add title to your request body", 422);
    return next(error);
  }

  const { title } = req.body;

  const createdList = new List({
    title,
    items: [],
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating list failed, please try again. USER",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find user for the provided id.",
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdList.save({ session: sess });
    user.lists.push(createdList);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating list failed. Please try again. Session",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ createdList: createdList.toObject({ getters: true }) });
};

const deleteList = async (req, res, next) => {
  const listId = req.params.listId;

  let list;
  try {
    list = await List.findById(listId).populate("creator");
  } catch (err) {
    const error = new HttpError("Could not delete list", 500);
    return next(error);
  }

  if (!list) {
    const error = new HttpError(
      "There is no list with this id: " + listId,
      404
    );
    return next(error);
  }

  if (list.creator.id.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized, to delete this list",
      403
    );

    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await list.remove({ session: sess });
    list.creator.lists.pull(list);
    await list.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Could not delete list", 500);
    return next(error);
  }

  res.json({ message: "Deleted list" });
};

const updateList = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Please add title and items(Array) to your request body",
      422
    );
    return next(error);
  }

  const { title, items } = req.body;

  const listId = req.params.listId;

  let list;
  try {
    list = await List.findById(listId).exec();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a list",
      500
    );
    return next(error);
  }

  if (!list) {
    const error = new HttpError(
      "Could not find a list with id: " + listId,
      404
    );
    return next(error);
  }

  if (list.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized, to udpate this list",
      403
    );
    return next(error);
  }

  list.title = title;
  list.items = items;

  try {
    await list.save();
  } catch (err) {
    const error = new HttpError("Updating list failed. Please try again.", 500);
    return next(error);
  }

  res.json({ updatedList: list.toObject({ getters: true }) });
};

exports.getLists = getLists;
exports.getList = getList;
exports.createList = createList;
exports.deleteList = deleteList;
exports.updateList = updateList;
