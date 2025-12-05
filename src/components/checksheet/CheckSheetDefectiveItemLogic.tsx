import { useEffect, useState, useRef } from "react";
import { useChecksheetStore } from "../../store/useChecksheetStore";
import { exportExcel } from "../../utils/dataio/excel/excel"
import { exportCSV } from "../../utils/dataio/csv/csv"
import { exportPDF } from "../../utils/dataio/pdf/pdf"

export interface Category {
  id: string;
  name: string;
  counts: Record<string, number>;
}

export const getRowTotal = (c: Category) =>
  Object.values(c.counts).reduce((sum, n) => sum + n, 0);

export const getAllTotal = (categories: Category[]) =>
  categories.reduce((sum, c) => sum + getRowTotal(c), 0);

export const getColTotal = (categories: Category[], day: string) =>
  categories.reduce((sum, c) => sum + (c.counts[day] ?? 0), 0);

const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_FIELDS = ["Product"];
const DEFAULT_METADATA: Record<string, string> = { product: "", date: "" };
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: crypto.randomUUID(),
    name: "Scratch",
    counts: Object.fromEntries(DEFAULT_DAYS.map(d => [d, 0]))
  },
  {
    id: crypto.randomUUID(),
    name: "Crack",
    counts: Object.fromEntries(DEFAULT_DAYS.map(d => [d, 0]))
  },
  {
    id: crypto.randomUUID(),
    name: "Bent",
    counts: Object.fromEntries(DEFAULT_DAYS.map(d => [d, 0]))
  }
];

export const useDefectiveItemLogic = () => {
  const store = useChecksheetStore();
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [newDay, setNewDay] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>(DEFAULT_METADATA);
  const [customFields, setCustomFields] = useState(DEFAULT_FIELDS);
  const [newField, setNewField] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [inputCat, setInputCat] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [manualInput, setManualInput] = useState(0);
  const [activeTab, setActiveTab] = useState<"day" | "cat">("day");
  const [cellBuffer, setCellBuffer] = useState("");
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

const getShareLink = () => {
  const snapshot = {
    days,
    metadata,
    customFields,
    categories,
  }

  const json = JSON.stringify(snapshot)
  const base64 = btoa(json)

  return `${window.location.origin}${window.location.pathname}?d=${base64}`
}

  const doExportCSV = () => {
    const prepared = sortedCategories.map(c => {
      const total = getRowTotal(c)
      const pct = allTotal > 0 ? (total / allTotal) * 100 : 0

      return {
        name: c.name,
        counts: c.counts,
        total,
        percentage: pct,
      }
    })

    exportCSV(
      {
        type: "CHECKSHEET",
        title: metadata.product || "Defective Item",
        days,
        categories: prepared,
        metadata,
        customFields,
        allTotal,
      },
      "defective-item"
    )
  }


  const doExportPDF = () => {
    const prepared = sortedCategories.map(c => {
      const total = getRowTotal(c)
      const pct = allTotal > 0 ? (total / allTotal) * 100 : 0

      return {
        name: c.name,
        counts: c.counts,
        total,
        percentage: pct,
      }
    })

    exportPDF(
      {
        type: "CHECKSHEET",
        title: metadata.product || "Defective Item",
        days,
        categories: prepared,
        metadata,
        customFields,
        allTotal,
      },
      "defective-item"
    )
  }

  const doExportExcel = () => {
    const prepared = sortedCategories.map(c => {
      const total = getRowTotal(c)
      const pct = allTotal > 0 ? (total / allTotal) * 100 : 0

      return {
        name: c.name,
        counts: c.counts,
        total,
        percentage: pct,
      }
    })

    exportExcel(
      {
        type: "CHECKSHEET",
        title: metadata.product || "Defective Item",
        days,
        categories: prepared,
        metadata,
        customFields,
        allTotal
      },
      "defective-item"
    )
  }

  const setSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const metadataFilled =
    customFields.every(f => (metadata[f] ?? "").trim()) &&
    (metadata.date ?? "").trim();


  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("d")
    if (encoded) {
      const decoded = JSON.parse(atob(encoded))

      setDays(decoded.days || DEFAULT_DAYS)
      setMetadata(decoded.metadata || DEFAULT_METADATA)
      setCustomFields(decoded.customFields || DEFAULT_FIELDS)
      setCategories(decoded.categories || DEFAULT_CATEGORIES)
      return
    }
    const snap = store.getSnapshot("defective-item");
    if (snap) {
      setDays(snap.data.days || DEFAULT_DAYS);
      setMetadata(snap.data.metadata || DEFAULT_METADATA);
      setCustomFields(snap.data.customFields || DEFAULT_FIELDS);
      setIsLocked(snap.data.isLocked || false);
      setCategories(snap.data.categories?.length > 0 ? snap.data.categories : DEFAULT_CATEGORIES);
    }
  }, []);

  const saveSnapshot = () => {
    store.setSnapshot("defective-item", {
      days,
      metadata,
      customFields,
      isLocked,
      categories
    });
  };


  const autoLockIfDataExists = () => {
    if (isLocked) return;
    const hasReject = categories.some(c => getRowTotal(c) > 0);
    if (metadataFilled && hasReject) {
      setIsLocked(true);
      saveSnapshot();
    }
  };

  const addCategory = () => {
    if (isLocked) return;
    const name = inputCat.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    const dayObj: Record<string, number> = {};
    days.forEach(d => (dayObj[d] = 0));
    const updated = [...categories, { id: crypto.randomUUID(), name, counts: dayObj }];
    setCategories(updated);
    setInputCat("");
    saveSnapshot();
  };

  const addDay = () => {
    if (isLocked) return;
    const d = newDay.trim();
    if (!d) return;
    if (days.includes(d)) return;
    const newDays = [...days, d];
    const newCats = categories.map(c => ({
      ...c,
      counts: { ...c.counts, [d]: 0 }
    }));
    setDays(newDays);
    setCategories(newCats);
    setNewDay("");
    saveSnapshot();
  };

  const removeDay = (dayToRemove: string) => {
    if (isLocked) return;
    const newDays = days.filter(d => d !== dayToRemove);
    const newCats = categories.map(c => {
      const newCounts = { ...c.counts };
      delete newCounts[dayToRemove];
      return { ...c, counts: newCounts };
    });
    setDays(newDays);
    setCategories(newCats);
    saveSnapshot();
  };

  const removeCategory = (id: string) => {
    if (isLocked) return;
    const newCats = categories.filter(c => c.id !== id);
    setCategories(newCats);
    saveSnapshot();
  };

  const addField = () => {
    if (isLocked) return;
    const f = newField.trim();
    if (!f) return;
    if (f === "date") return;
    if (customFields.includes(f)) return;
    const newCustom = [...customFields, f];
    setCustomFields(newCustom);
    setMetadata({ ...metadata, [f]: "" });
    setNewField("");
    saveSnapshot();
  };

  const removeField = (f: string) => {
    if (isLocked) return;
    if (f === "date") return;
    const newFields = customFields.filter(x => x !== f);
    const m = { ...metadata };
    delete m[f];
    setCustomFields(newFields);
    setMetadata(m);
    saveSnapshot();
  };

  const increment = () => {
    if (!selectedCat || !selectedDay) return;
    const newCats = categories.map(c =>
      c.id === selectedCat
        ? { ...c, counts: { ...c.counts, [selectedDay]: c.counts[selectedDay] + 1 } }
        : c
    );
    setCategories(newCats);
    saveSnapshot();
    autoLockIfDataExists();
  };

  const decrement = () => {
    if (!selectedCat || !selectedDay) return;
    const newCats = categories.map(c =>
      c.id === selectedCat && c.counts[selectedDay] > 0
        ? { ...c, counts: { ...c.counts, [selectedDay]: c.counts[selectedDay] - 1 } }
        : c
    );
    setCategories(newCats);
    saveSnapshot();
    autoLockIfDataExists();
  };

  const applyManualInput = () => {
    if (!selectedCat || !selectedDay) return;
    if (manualInput < 0) return;
    const newCats = categories.map(c =>
      c.id === selectedCat
        ? { ...c, counts: { ...c.counts, [selectedDay]: manualInput } }
        : c
    );
    setCategories(newCats);
    setManualInput(0);
    saveSnapshot();
    autoLockIfDataExists();
  };

  const resetRow = () => {
    if (!selectedCat) return;
    const newCats = categories.map(c =>
      c.id === selectedCat
        ? { ...c, counts: Object.fromEntries(days.map(d => [d, 0])) }
        : c
    );
    setCategories(newCats);
    saveSnapshot();
  };

  const renameDay = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    if (days.includes(newName)) return;
    const newDays = days.map(d => (d === oldName ? newName : d));
    const newCats = categories.map(c => {
      const newCounts: Record<string, number> = {};
      for (const key in c.counts) {
        newCounts[key === oldName ? newName : key] = c.counts[key];
      }
      return { ...c, counts: newCounts };
    });
    setDays(newDays);
    setCategories(newCats);
    saveSnapshot();
  };

  const renameCategory = (id: string, newName: string) => {
    if (!newName.trim()) return;
    const newCats = categories.map(c =>
      c.id === id ? { ...c, name: newName } : c
    );
    setCategories(newCats);
    saveSnapshot();
  };


  const clearAll = () => {
    if (!confirm("Clear data?")) return;
    setDays(DEFAULT_DAYS);
    setMetadata(DEFAULT_METADATA);
    setCustomFields(DEFAULT_FIELDS);
    setCategories(DEFAULT_CATEGORIES);
    setSelectedDay("");
    setSelectedCat(null);
    setIsLocked(false);
    saveSnapshot();
  };

  const setCellValue = (rowIndex: number, colIndex: number, value: number) => {
    const catId = sortedCategories[rowIndex].id;
    const dayKey = days[colIndex];
    const newCats = categories.map(c =>
      c.id === catId ? { ...c, counts: { ...c.counts, [dayKey]: value } } : c
    );
    setCategories(newCats);
    saveSnapshot();
    autoLockIfDataExists();
  };

  const handleCellKeyDown = (e: any, rowIndex: number, colIndex: number) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }

    if (!isLocked && e.key >= "0" && e.key <= "9") {
      const newBuf = cellBuffer + e.key;
      setCellBuffer(newBuf);
      setCellValue(rowIndex, colIndex, Number(newBuf));
    }

    if (!isLocked && e.key === "Backspace") {
      const newBuf = cellBuffer.slice(0, -1);
      setCellBuffer(newBuf);
      setCellValue(rowIndex, colIndex, newBuf === "" ? 0 : Number(newBuf));
    }

    if (e.key === "Enter") {
      setCellBuffer("");
    }

    if (e.key === "ArrowUp") {
      if (rowIndex > 0) {
        const next = cellRefs.current[rowIndex - 1]?.[colIndex];
        if (next) next.focus();
      }
    }

    if (e.key === "ArrowDown") {
      if (rowIndex < sortedCategories.length - 1) {
        const next = cellRefs.current[rowIndex + 1]?.[colIndex];
        if (next) next.focus();
      }
    }

    if (e.key === "ArrowLeft") {
      if (colIndex > 0) {
        const next = cellRefs.current[rowIndex]?.[colIndex - 1];
        if (next) next.focus();
      }
    }

    if (e.key === "ArrowRight") {
      if (colIndex < days.length - 1) {
        const next = cellRefs.current[rowIndex]?.[colIndex + 1];
        if (next) next.focus();
      }
    }
  };

  const allTotal = getAllTotal(categories);
  const sortedCategories = [...categories].sort((a, b) => {
    if (!sortKey) return 0

    if (sortKey === "name") {
      return sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }

    if (days.includes(sortKey)) {
      return sortAsc
        ? a.counts[sortKey] - b.counts[sortKey]
        : b.counts[sortKey] - a.counts[sortKey]
    }

    if (sortKey === "total") {
      return sortAsc
        ? getRowTotal(a) - getRowTotal(b)
        : getRowTotal(b) - getRowTotal(a)
    }

    if (sortKey === "pct") {
      const pctA = allTotal > 0 ? (getRowTotal(a) / allTotal) * 100 : 0
      const pctB = allTotal > 0 ? (getRowTotal(b) / allTotal) * 100 : 0
      return sortAsc ? pctA - pctB : pctB - pctA
    }

    return 0
  })
  const paretoData = (() => {
    let running = 0
    return sortedCategories.map(c => {
      const total = getRowTotal(c)
      const pct = allTotal > 0 ? (total / allTotal) * 100 : 0
      running += pct
      return {
        id: c.id,
        name: c.name,
        total,
        pct,
        cumPct: running
      }
    })
  })()

  const focusDefects = paretoData.filter(x => x.cumPct <= 80)

  const focusCoverage = focusDefects.length > 0
    ? focusDefects[focusDefects.length - 1].cumPct
    : 0

  const dayTotals = days.map(d => ({
    day: d,
    total: getColTotal(categories, d)
  }))

  const worstDay = dayTotals.length > 0
    ? dayTotals.reduce((max, cur) => cur.total > max.total ? cur : max, dayTotals[0])
    : { day: "", total: 0 }



  return {
    days, setDays,
    newDay, setNewDay,
    newField, setNewField,
    customFields, setCustomFields,
    metadata, setMetadata,
    categories, setCategories,
    inputCat, setInputCat,
    selectedCat, setSelectedCat,
    selectedDay, setSelectedDay,
    manualInput, setManualInput,
    activeTab, setActiveTab,
    isLocked, setIsLocked,
    cellBuffer, setCellBuffer,
    cellRefs,
    addCategory, addDay, removeCategory, removeDay,
    addField, removeField,
    increment, decrement, applyManualInput,
    resetRow, clearAll,
    allTotal, sortedCategories,
    getRowTotal, getColTotal,
    metadataFilled,
    handleCellKeyDown, renameDay,
    renameCategory,
    sortKey,
    sortAsc,
    setSort,
    doExportExcel,
    doExportCSV,
    doExportPDF,
    setCellValue,
    getShareLink,
    paretoData,
    focusDefects,
    focusCoverage,
    dayTotals,
    worstDay,

  };
};
