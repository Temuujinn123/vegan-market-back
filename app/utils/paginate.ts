import { Model } from "mongoose";
import { PaginationDto } from "../types/product";
import Invoice from "../models/Invoice";

const Pagintate = async function (
    page: number,
    limit: number,
    model: Model<any>,
    filter?: Object
) {
    if (filter === undefined) {
        filter = {
            is_deleted: false,
        };
    }

    const total = await model.countDocuments(filter);
    const pageCount = Math.ceil(total / limit);
    const start = (page - 1) * limit + 1;
    let end = start + limit - 1;
    if (end > total) end = total;
    const pagination: PaginationDto = {
        total,
        pageCount,
        start,
        end,
        limit: +limit,
    };

    if (page < pageCount) pagination.nextPage = +page + 1;
    if (page > pageCount) pagination.prevPage = +page - 1;

    return pagination;
};

export default Pagintate;
