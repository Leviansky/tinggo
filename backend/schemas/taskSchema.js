const { z } = require('zod');

const createTaskSchema = z.object({
    title: z.string().min(1, 'Title wajib diisi'),
    description: z.string().optional().nullable(),
    status: z.enum(['pending', 'in-progress', 'done']).optional().default('pending'),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Format deadline tidak valid" }).optional().nullable()
});

const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title wajib diisi'),
    description: z.string().optional().nullable(),
    status: z.enum(['pending', 'in-progress', 'done']),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Format deadline tidak valid" }).optional().nullable()
});

module.exports = {
    createTaskSchema,
    updateTaskSchema
};
