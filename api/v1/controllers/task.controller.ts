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

export const changeStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const status = req.body.status;
    

    await Task.updateOne({ _id: id }, { status: status });

    res.json({
      code: 200,
      message: 'Status updated successfully'
    });
  } catch {
    res.json({
      code: 400,
      message: 'Error updating status'
    });
  }
}

export const changeMulti = async (req: Request, res: Response) => {
  try {
    const { ids, key, value } = req.body;

    enum changeKey {
      STATUS = 'status',
      DELETE = 'delete'
    }

    switch (key) {
      case changeKey.STATUS:
        await Task.updateMany({
          _id: { $in: ids },
        }, {
          status: value
        });

        res.json({
          code: 200,
          message: 'Status updated successfully'
        });
        break;

      case changeKey.DELETE:
        await Task.updateMany({
          _id: { $in: ids },
        }, {
          deleted: true,
          deletedAt: Date.now()
        });

        res.json({
          code: 200,
          message: 'Delete multi successfully'
        });
        break;

      default:
        res.json({
          code: 400,
          message: 'Error updating'
        });
        break;
    }
    

  } catch {
    res.json({
      code: 400,
      message: 'Error updating status'
    });
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    const data = await task.save();

    res.json({
      code: 200,
      message: 'Created task successfully',
      data: data
    });
  } catch {
    res.json({
      code: 400,
      message: 'Error creating task'
    });
  }
}

export const edit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, req.body);

    res.json({
      code: 200,
      message: 'Edit task successfully'
    });

  } catch {
    res.json({
      code: 400,
      message: 'Error editing task'
    });
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, {
      deleted: true,
      deletedAt: new Date()
    });

    res.json({
      code: 200,
      message: 'Delete task successfully'
    });

  } catch {
    res.json({
      code: 400,
      message: 'Error deleting task'
    });
  }
}