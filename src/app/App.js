import {
  courseTrail,
  defaultReflection,
  focusQuestions,
  implementationChecklist,
  lensOptions,
  sections,
  studentProfile,
  themeOptions,
} from "../data/content.js";
import { fragment, h } from "../runtime/h.js";
import { useEffect, useMemo, useState } from "../runtime/hooks.js";
import {
  ChecklistPanel,
  ControlBar,
  FooterBar,
  HeroPanel,
  QuestionPanel,
  ReflectionPanel,
  RuntimePanelShell,
  SectionShowcase,
  SectionTabs,
} from "./components.js";

const STORAGE_KEY = "week5-react-dashboard";

let cachedInitialState = null;
let appActions = {};

function readPersistedState() {
  if (cachedInitialState) {
    return cachedInitialState;
  }

  if (typeof window === "undefined" || !window.localStorage) {
    cachedInitialState = {};
    return cachedInitialState;
  }

  try {
    cachedInitialState = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch (error) {
    cachedInitialState = {};
  }

  return cachedInitialState;
}

function matchesLens(card, selectedLens) {
  return selectedLens === "all" || card.lenses.includes(selectedLens);
}

function matchesQuery(section, card, query) {
  if (!query) {
    return true;
  }

  const searchTarget = [
    section.title,
    section.summary,
    ...section.tags,
    card.title,
    card.detail,
    ...card.lenses,
  ]
    .join(" ")
    .toLowerCase();

  return searchTarget.includes(query);
}

export function buildSectionViews(baseSections, query, selectedLens) {
  const normalizedQuery = query.trim().toLowerCase();

  return baseSections.map((section) => {
    const visibleCards = section.cards.filter(
      (card) => matchesLens(card, selectedLens) && matchesQuery(section, card, normalizedQuery),
    );

    return {
      ...section,
      visibleCards,
    };
  });
}

export function computeProgress(sectionViews, completedIds, interactionCount) {
  const totalChecklist = implementationChecklist.length;
  const totalCardCount = sections.reduce((count, section) => count + section.cards.length, 0);
  const visibleCardCount = sectionViews.reduce((count, section) => count + section.visibleCards.length, 0);
  const matchingSectionCount = sectionViews.filter((section) => section.visibleCards.length > 0).length;

  return {
    completedCount: completedIds.length,
    totalChecklist,
    totalCardCount,
    visibleCardCount,
    matchingSectionCount,
    interactionCount,
  };
}

function themeLabel(themeId) {
  return themeOptions.find((option) => option.id === themeId)?.label ?? themeOptions[0].label;
}

function bumpInteraction(setInteractionCount) {
  setInteractionCount((count) => count + 1);
}

export function getAppActions() {
  return appActions;
}

export function App() {
  const initialState = readPersistedState();
  const [activeSection, setActiveSection] = useState(initialState.activeSection ?? sections[0].id);
  const [selectedLens, setSelectedLens] = useState(initialState.selectedLens ?? "all");
  const [query, setQuery] = useState(initialState.query ?? "");
  const [completedIds, setCompletedIds] = useState(initialState.completedIds ?? []);
  const [note, setNote] = useState(initialState.note ?? defaultReflection);
  const [attendanceChecked, setAttendanceChecked] = useState(initialState.attendanceChecked ?? false);
  const [theme, setTheme] = useState(initialState.theme ?? themeOptions[0].id);
  const [questionIndex, setQuestionIndex] = useState(initialState.questionIndex ?? 0);
  const [interactionCount, setInteractionCount] = useState(initialState.interactionCount ?? 0);

  const sectionViews = useMemo(
    () => buildSectionViews(sections, query, selectedLens),
    [query, selectedLens],
  );
  const activeSectionView = useMemo(
    () => sectionViews.find((section) => section.id === activeSection) ?? sectionViews[0],
    [activeSection, sectionViews],
  );
  const progress = useMemo(
    () => computeProgress(sectionViews, completedIds, interactionCount),
    [sectionViews, completedIds, interactionCount],
  );
  const currentQuestion = useMemo(
    () => focusQuestions[questionIndex % focusQuestions.length],
    [questionIndex],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return undefined;
    }

    const nextState = {
      activeSection,
      selectedLens,
      query,
      completedIds,
      note,
      attendanceChecked,
      theme,
      questionIndex,
      interactionCount,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    cachedInitialState = nextState;
    return undefined;
  }, [
    activeSection,
    selectedLens,
    query,
    completedIds,
    note,
    attendanceChecked,
    theme,
    questionIndex,
    interactionCount,
  ]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    document.body.dataset.theme = theme;
    document.body.dataset.activeSection = activeSection;
    document.title = `${progress.completedCount}/${progress.totalChecklist} 구현 | ${activeSectionView.title}`;

    return () => {
      document.body.removeAttribute("data-active-section");
    };
  }, [theme, activeSection, activeSectionView.title, progress.completedCount, progress.totalChecklist]);

  appActions = {
    setSection(sectionId) {
      setActiveSection(sectionId);
      bumpInteraction(setInteractionCount);
    },
    setLens(lensId) {
      setSelectedLens(lensId);
      bumpInteraction(setInteractionCount);
    },
    setTheme(themeId) {
      setTheme(themeId);
      bumpInteraction(setInteractionCount);
    },
    toggleAttendance() {
      setAttendanceChecked((value) => !value);
      bumpInteraction(setInteractionCount);
    },
    toggleChecklist(itemId) {
      setCompletedIds((items) =>
        items.includes(itemId) ? items.filter((id) => id !== itemId) : [...items, itemId],
      );
      bumpInteraction(setInteractionCount);
    },
    nextQuestion() {
      setQuestionIndex((index) => index + 1);
      bumpInteraction(setInteractionCount);
    },
    searchQuery(value) {
      setQuery(value);
      bumpInteraction(setInteractionCount);
    },
    updateNote(value) {
      setNote(value);
    },
    resetBoard() {
      setActiveSection(sections[0].id);
      setSelectedLens("all");
      setQuery("");
      setCompletedIds([]);
      setNote(defaultReflection);
      setAttendanceChecked(false);
      setTheme(themeOptions[0].id);
      setQuestionIndex(0);
      bumpInteraction(setInteractionCount);
    },
  };

  return fragment(
    h(
      "div",
      { className: "page-scene" },
      h(HeroPanel, {
        courseTrail,
        profile: studentProfile,
        progress,
        themeLabel: themeLabel(theme),
      }),
      h(ControlBar, {
        query,
        selectedLens,
        lensOptions,
        activeTheme: theme,
        themeOptions,
        attendanceChecked,
      }),
      h(
        "div",
        { className: "content-grid" },
        h(
          "div",
          { className: "main-column" },
          h(SectionTabs, {
            sections: sectionViews,
            activeSection,
          }),
          h(SectionShowcase, {
            section: activeSectionView,
            query,
          }),
        ),
        h(
          "aside",
          { className: "side-column" },
          h(ChecklistPanel, {
            checklist: implementationChecklist,
            completedIds,
          }),
          h(QuestionPanel, {
            question: currentQuestion,
            index: questionIndex % focusQuestions.length,
            total: focusQuestions.length,
          }),
          h(ReflectionPanel, {
            note,
          }),
          h(RuntimePanelShell),
        ),
      ),
      h(FooterBar, {
        progress,
        activeSectionTitle: activeSectionView.title,
      }),
    ),
  );
}
