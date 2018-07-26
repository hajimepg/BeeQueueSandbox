import test from "ava";
import Queue from "bee-queue";

test("Create Queue", (t) => {
    t.plan(0);
    // noinspection JSUnusedLocalSymbols
    const queue = new Queue("test");
});

test("Create Job", async (t) => {
    t.plan(0);
    const queue = new Queue("test");
    const job = queue.createJob({});
    await job.save();
});

test("Process Job", (t) => {
    return new Promise(async (resolve) => {
        t.plan(0);
        const queue = new Queue("test");
        const job = queue.createJob({ lhs: 1, rhs: 2 });
        await job.save();

        queue.process(async (job) => {
            return job.data.lhs + job.data.rhs;
        });

        setTimeout(resolve, 100);
    });
});

test("Receive Job succeeded Event", (t) => {
    return new Promise(async (resolve) => {
        const queue = new Queue("test");
        const job = queue.createJob({ lhs: 1, rhs: 2 });
        await job.save();

        job.on("succeeded", (result) => {
            t.is(3, result);
            resolve();
        });

        queue.process(async (job) => {
            return job.data.lhs + job.data.rhs;
        });
    });
});
