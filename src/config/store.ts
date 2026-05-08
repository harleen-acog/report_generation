import Conf from "conf";

const config = new Conf({
  projectName: "author-cli",
});

export function setApiKey(key: string) {
  config.set("GOOGLE_GENERATIVE_AI_API_KEY", key);
}


export function getApiKey(): string | undefined {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    (config.get("GOOGLE_GENERATIVE_AI_API_KEY") as string | undefined)
  );
}

export function clearApiKey() {
  config.delete("GOOGLE_GENERATIVE_AI_API_KEY");
}