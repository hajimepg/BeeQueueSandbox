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

        // noinspection JSUnresolvedFunction
        job.on("succeeded", (result) => {
            t.is(3, result);
            resolve();
        });

        queue.process(async (job) => {
            return job.data.lhs + job.data.rhs;
        });
    });
});

test("Receive Job succeeded Event on Other Instance", (t) => {
    return new Promise(async (resolve, reject) => {
        const queue = new Queue("test");
        const job = queue.createJob({ lhs: 1, rhs: 2 });
        await job.save();

        queue.getJob(job.id, (error, otherJobInstance) => {
            if (error !== null) {
                reject(error);
                return;
            }

            const callbackHistory = [];
            // noinspection JSUnresolvedFunction
            job.on("succeeded", () => { callbackHistory.push("job"); });
            // noinspection JSUnresolvedFunction
            otherJobInstance.on("succeeded", () => { callbackHistory.push("otherJobInstance"); });

            setTimeout(() => {
                t.true(callbackHistory.includes("job"));
                t.true(callbackHistory.includes("otherJobInstance"));
                resolve();
            }, 100);

            queue.process(async (job) => {
                return job.data.lhs + job.data.rhs;
            });
        });
    });
});
