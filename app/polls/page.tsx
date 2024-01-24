import {kv} from "@vercel/kv";
import {Feature, Poll} from "@/app/types";

const ONE_DAY_IN_MS = 86400000;

async function getPolls() {
    try {
        let pollIds = await kv.zrange("polls_by_date", Date.now(), Date.now() - ONE_DAY_IN_MS, {byScore: true, rev: true});

        if (!pollIds.length) {
            return [];
        }

        let multi = kv.multi();
        pollIds.forEach((id) => {
            multi.hgetall(`poll:${id}`);
        });

        let items: Poll[] = await multi.exec();
        return items.map((item) => {
            return {...item};
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default async function Page() {
    const polls = await getPolls();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                <h1 className="text-lg sm:text-2xl font-bold mb-2">
                    Created Polls
                </h1>
                <div className="flex-1 flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
                    {
                        polls.map((poll) => {
                        // returns links to poll ids
                        return (<div key={poll.id}>
                            <a href={`/polls/${poll.id}`} className="underline">
                                <p className="text-md sm:text-xl mx-4">{poll.title}</p>
                            </a>
                        </div>)
                        })
                    }
                </div>
            </main>
        </div>
    );
}