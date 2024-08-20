<script lang="ts">
    import axios, { AxiosError } from "axios";
    import { onMount } from "svelte";

    interface Choice {
        name: string;
        emoji: string;
    }

    interface Problem {
        problem: string;
        choice1: Choice;
        choice2: Choice;
    }

    let problem: Problem | null = null;
    let loading = true;
    let error: string | null = null;

    onMount(fetchProblem);

    async function fetchProblem() {
        try {
            const res = await axios.get("/api");
            problem = res.data;
        } catch (err) {
            if (err instanceof AxiosError) {
                error = err.message;
            } else {
                error = "An unknown error occurred.";
            }
        } finally {
            loading = false;
        }
    }

    async function choose(choice: Choice | undefined) {
        if (!choice) return;
        let success = false;
        while (!success) {
            try {
                loading = true;
                const res = await axios.get("/api", {
                    params: {
                        choice1: choice.name,
                        emoji1: choice.emoji,
                    },
                });
                problem = res.data;
                success = true;
            } catch (err) {
                if (err instanceof AxiosError) {
                    error = err.message;
                } else {
                    error = "An unknown error occurred.";
                }
            } finally {
                loading = false;
            }
            await new Promise((res) => setTimeout(res, 5000));
        }
    }
</script>

<main>
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p>Error: {error}<br />trying again in 5 seconds...</p>
    {:else if problem}
        <p>{problem.problem}</p>
        <div id="image-container">
            <img src="/background.png" alt="trolley problem background" id="background" />
            <div id="emoji-1">{problem.choice1.emoji}</div>
            <div id="emoji-2">{problem.choice2.emoji}</div>
        </div>
        <div id="buttons">
            <button on:click={() => choose(problem?.choice2)}>
                do nothing {problem.choice1.emoji}
            </button>
            <button on:click={() => choose(problem?.choice1)}>
                pull the switch {problem.choice2.emoji}
            </button>
        </div>
    {/if}

    <footer>made by <a href="http://github.com/hexxt-git">HEXXT</a></footer>
</main>

<style>
    main {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        max-width: 90vw;
        margin: 0 auto;
        gap: 50px;
        position: relative;
    }
    p {
        max-width: 700px;
        text-align: center;
        font-size: 1.3rem;
    }
    #image-container {
        position: relative;
        user-select: none;
        pointer-events: none;
    }
    #emoji-1,
    #emoji-2 {
        position: absolute;
        font-size: 70px;
        text-align: center;
    }
    #emoji-1 {
        top: 58%;
        right: 22%;
    }
    #emoji-2 {
        top: 25%;
        right: 15%;
    }
    @media (max-width: 600px) {
        p {
            font-size: 1.1rem;
        }
        #emoji-1,
        #emoji-2 {
            font-size: 35px;
        }
    }
    #background {
        width: 1000px;
        max-width: 100%;
    }
    #buttons {
        display: flex;
        gap: 15px;
    }
    button {
        background: white;
        border: solid black 2px;
        border-radius: 8px;
        padding: 5px 12px;
        cursor: pointer;
        margin-bottom: 50px;
    }
    button:hover {
        background: #f3f3f3;
    }
    footer{
        color: #888;
        position: absolute;
        bottom: 15px;
        width: 100%;
        text-align: center;
    }
    footer a{
        color: inherit;
    }
</style>
