import { db } from "../core/config/knex.js";


export const getAll = () =>
    db('master_agama').select().orderBy('IDAGAMA', 'asc');

export const getById = (id) =>
    db('master_agama').where({ IDAGAMA: id }).first();

export const create = (data) =>
    db('master_agama').insert(data);

export const update = (id, data) =>
    db('master_agama').where({ IDAGAMA: id }).update(data);

export const remove = (id) =>
    db('master_agama').where({ IDAGAMA: id }).del();