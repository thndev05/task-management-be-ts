"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.edit = exports.create = exports.changeMulti = exports.changeStatus = exports.detail = exports.index = void 0;
const task_model_1 = __importDefault(require("../models/task.model"));
const pagination_1 = __importDefault(require("../../../helpers/pagination"));
const search_1 = __importDefault(require("../../../helpers/search"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = {
        deleted: false
    };
    if (req.query.status) {
        find.status = req.query.status.toString();
    }
    // Sort
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey.toString();
        sort[sortKey] = req.query.sortValue;
    }
    // Search
    const objectSearch = (0, search_1.default)(req.query);
    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }
    //Pagination
    const countTasks = yield task_model_1.default.countDocuments(find);
    let objectPagination = (0, pagination_1.default)({
        currentPage: 1,
        limitItems: 4,
    }, req.query, countTasks);
    const tasks = yield task_model_1.default.find(find).sort(sort)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip || 0);
    res.json(tasks);
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const task = yield task_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    res.json(task);
});
exports.detail = detail;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const status = req.body.status;
        yield task_model_1.default.updateOne({ _id: id }, { status: status });
        res.json({
            code: 200,
            message: 'Status updated successfully'
        });
    }
    catch (_a) {
        res.json({
            code: 400,
            message: 'Error updating status'
        });
    }
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids, key, value } = req.body;
        let changeKey;
        (function (changeKey) {
            changeKey["STATUS"] = "status";
            changeKey["DELETE"] = "delete";
        })(changeKey || (changeKey = {}));
        switch (key) {
            case changeKey.STATUS:
                yield task_model_1.default.updateMany({
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
                yield task_model_1.default.updateMany({
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
    }
    catch (_a) {
        res.json({
            code: 400,
            message: 'Error updating status'
        });
    }
});
exports.changeMulti = changeMulti;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = new task_model_1.default(req.body);
        const data = yield task.save();
        res.json({
            code: 200,
            message: 'Created task successfully',
            data: data
        });
    }
    catch (_a) {
        res.json({
            code: 400,
            message: 'Error creating task'
        });
    }
});
exports.create = create;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield task_model_1.default.updateOne({ _id: id }, req.body);
        res.json({
            code: 200,
            message: 'Edit task successfully'
        });
    }
    catch (_a) {
        res.json({
            code: 400,
            message: 'Error editing task'
        });
    }
});
exports.edit = edit;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield task_model_1.default.updateOne({ _id: id }, {
            deleted: true,
            deletedAt: new Date()
        });
        res.json({
            code: 200,
            message: 'Delete task successfully'
        });
    }
    catch (_a) {
        res.json({
            code: 400,
            message: 'Error deleting task'
        });
    }
});
exports.deleteTask = deleteTask;
