import { Request, Response } from "express"
import Task from '../models/task.model';
import paginationHelper from "../../../helpers/pagination";
import searchHelper from "../../../helpers/search";

export const index = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean,
    status?: string,
    title?: RegExp | string
  } = {
    deleted: false
  }

  if(req.query.status) {
    find.status = req.query.status.toString();
  }

  // Sort
  const sort: { [key: string]: any } = {}
  if (req.query.sortKey && req.query.sortValue) {
    const sortKey: string = req.query.sortKey.toString();
    sort[sortKey] = req.query.sortValue;
  }

  // Search
  const objectSearch = searchHelper(req.query);
  if(objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  //Pagination
  const countTasks = await Task.countDocuments(find);

  let objectPagination = paginationHelper({
    currentPage: 1,
    limitItems: 4,
  },
    req.query,
    countTasks
  );

  const tasks = await Task.find(find).sort(sort)
  .limit(objectPagination.limitItems)
  .skip(objectPagination.skip || 0);

  res.json(tasks);
}

export const detail = async (req: Request, res: Response) => {
  const id = req.params.id;

  const task = await Task.findOne({
    _id: id,
    deleted: false
  })

  res.json(task);
}