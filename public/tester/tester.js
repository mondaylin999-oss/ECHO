// Plain manual tester for the API. Not the real front-end.
const content = document.getElementById("content");
const bodiesEl = document.getElementById("bodies");

async function api(path, options) {
  const res = await fetch(`/api${path}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${json.error?.code}: ${json.error?.message}`);
  return json;
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "style") node.style.cssText = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node[key] = value;
  }
  for (const child of [].concat(children)) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

const section = (title, children) => el("section", {}, [el("h2", { textContent: title }), ...children]);

const rawJson = (data) =>
  el("details", {}, [
    el("summary", { className: "muted", textContent: "Raw JSON" }),
    el("pre", { textContent: JSON.stringify(data, null, 2) }),
  ]);

function showError(err) {
  content.replaceChildren(section("Error", [el("p", { className: "bad", textContent: err.message })]));
}

function factsTable(rows) {
  return el(
    "table",
    {},
    rows.map(([label, value]) => el("tr", {}, [el("td", { textContent: label }), el("td", { textContent: value })])),
  );
}

async function showBody(id) {
  try {
    const body = await api(`/bodies/${id}`);
    const toolArea = el("div");
    const quizArea = el("div");

    const parts = [
      section(`${body.name} (${body.type})`, [
        el("p", { textContent: body.summary }),
        factsTable([
          ["Radius", `${body.facts.radiusKm} km`],
          ["Distance from parent", `${body.facts.distanceFromParentMillionKm} million km`],
          ["Orbital period", `${body.facts.orbitalPeriodDays} days`],
          ["Rotation period", `${body.facts.rotationPeriodHours} hours`],
          ["Axial tilt", `${body.facts.axialTiltDeg} deg`],
          ["Parent", body.parentId ?? "none"],
          ["Rings", body.visual.hasRings ? "yes" : "no"],
        ]),
        rawJson(body),
      ]),
    ];

    if (body.tools.length > 0) {
      parts.push(
        section("Tools", [
          el(
            "div",
            { className: "row" },
            body.tools.map((tool) =>
              el("button", {
                textContent: `${tool.name} (${tool.location.latDeg}, ${tool.location.lonDeg})`,
                onclick: () => showTool(tool.id, toolArea),
              }),
            ),
          ),
          toolArea,
        ]),
        section("Quiz", [
          el("button", { textContent: "Load quiz", onclick: () => showQuiz(body.id, quizArea) }),
          quizArea,
        ]),
      );
    } else {
      parts.push(section("Tools", [el("p", { className: "muted", textContent: "No tools or quiz: hasData is false." })]));
    }

    content.replaceChildren(...parts);
  } catch (err) {
    showError(err);
  }
}

async function showTool(toolId, target) {
  try {
    const tool = await api(`/tools/${toolId}`);
    target.replaceChildren(
      el("div", { style: "margin-top: 16px" }, [
        el("h3", { textContent: tool.name }),
        el("p", { className: "muted", textContent: `${tool.agency}, ${tool.year} - ${tool.modelType} - ${tool.location.site}` }),
        el("p", { textContent: tool.summary }),
        el("ul", {}, tool.facts.map((fact) => el("li", { textContent: fact }))),
        el(
          "div",
          { className: "images" },
          ["top", "left", "right"].map((view) =>
            el("figure", {}, [
              el("img", { src: tool.images[view].url, alt: tool.images[view].alt }),
              el("figcaption", { textContent: `${tool.images[view].caption} - ${tool.images[view].credit}` }),
            ]),
          ),
        ),
        rawJson(tool),
      ]),
    );
  } catch (err) {
    target.replaceChildren(el("p", { className: "bad", textContent: err.message }));
  }
}

async function showQuiz(bodyId, target) {
  try {
    const quiz = await api(`/quiz/${bodyId}`);
    target.replaceChildren(
      el("div", { style: "margin-top: 16px" }, [
        ...quiz.questions.map((question, index) => {
          const result = el("div", { className: "result" });
          return el("div", { className: "question" }, [
            el("p", {}, [
              `${index + 1}. ${question.prompt} `,
              el("span", { className: "muted", textContent: `[${question.difficulty}${question.relatedToolId ? `, ${question.relatedToolId}` : ""}]` }),
            ]),
            el(
              "div",
              { className: "row" },
              question.options.map((option) =>
                el("button", {
                  textContent: option.text,
                  onclick: () => answer(bodyId, question, option.id, result),
                }),
              ),
            ),
            result,
          ]);
        }),
        rawJson(quiz),
      ]),
    );
  } catch (err) {
    target.replaceChildren(el("p", { className: "bad", textContent: err.message }));
  }
}

async function answer(bodyId, question, optionId, target) {
  try {
    const result = await api(`/quiz/${bodyId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, optionId }),
    });
    const right = question.options.find((option) => option.id === result.correctOptionId);
    target.className = `result ${result.correct ? "ok" : "bad"}`;
    target.textContent = `${result.correct ? "Correct." : `Not quite. Answer: ${right?.text}.`} ${result.explanation}`;
  } catch (err) {
    target.className = "result bad";
    target.textContent = err.message;
  }
}

async function showScript() {
  try {
    const script = await api("/astronaut/script");
    content.replaceChildren(
      section(`${script.speaker} says`, [
        el("ol", {}, script.lines.map((line) => el("li", { textContent: line.text, style: "margin-bottom: 6px" }))),
        el("p", { className: "muted", textContent: `End prompt: ${script.endPrompt}` }),
        rawJson(script),
      ]),
    );
  } catch (err) {
    showError(err);
  }
}

async function init() {
  document.getElementById("script-button").addEventListener("click", showScript);
  try {
    const { bodies } = await api("/bodies");
    bodiesEl.replaceChildren(
      ...bodies.map((body) => {
        const button = el("button", {}, [
          el("span", { className: "dot", style: `background: ${body.visual.colorHex}` }),
          body.name,
          ...(body.hasData ? [el("span", { className: "tag", textContent: "data" })] : []),
        ]);
        button.addEventListener("click", () => {
          bodiesEl.querySelectorAll("button").forEach((other) => other.classList.remove("active"));
          button.classList.add("active");
          showBody(body.id);
        });
        return button;
      }),
    );
  } catch (err) {
    showError(err);
  }
}

init();
