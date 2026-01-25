import { PanelSection, ButtonItem, PanelSectionRow } from "decky-frontend-lib";

const open = (url: string) => {
  try {
    window.open(url, "_blank");
  } catch (e) {
    console.error("Failed to open URL:", url, e);
  }
};

const ru = navigator.language?.toLowerCase().startsWith("ru");

const Credits = () => (
  <PanelSection>
    <PanelSectionRow>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <PanelSectionRow>
        <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
          <strong style={{ color: "#71c6ff" }}>
            {ru ? "Выражаю благодарность death_nick" : "Special thanks to death_nick"}
          </strong>
          {ru
            ? " за то, что он создал этот плагин и проделал много работы с ним!"
            : " for creating this plugin and doing a lot of work on it!"}
          <br />
          {ru
              ? "Данный плагин является продолжением его работы."
              : "This plugin is a continuation of his work."}
          </div>
        </PanelSectionRow>

        <PanelSectionRow>
          <div style={{ textAlign: "center", width: "100%" }}>
            <strong>{ru ? "Вам" : "You"}</strong> —{" "}
            {ru ? "за использование" : "for using"} <strong>DeckyWARP</strong>!
          </div>
        </PanelSectionRow>

        <ButtonItem layout="below" onClick={() => open("https://github.com/mashakulina/DeckyWARP")}>
          <span style={{ color: "#71c6ff" }}>
            {ru ? "Ссылка на Github проекта" : "Project GitHub Link"}
          </span>
        </ButtonItem>
      </div>
    </PanelSectionRow>

    <PanelSectionRow>
      <div style={{ fontSize: "12px", color: "#aaa", width: "100%", textAlign: "center" }}>
        <i>
          {ru
            ? "Оригинальный плагин разработан death_nick совместно с ChatGPT. Данный плагин доработан Mels Kappi. Приятного пользования!"
            : "The original plugin was developed by death_nick in collaboration with ChatGPT. This plugin has been enhanced by Mels Kappi. Enjoy using it!"}
        </i>
      </div>
    </PanelSectionRow>
  </PanelSection>
);

export default Credits;
