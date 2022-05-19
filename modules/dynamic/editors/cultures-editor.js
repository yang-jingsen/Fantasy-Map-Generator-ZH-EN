const body = insertEditorHtml();
addListeners();

const cultureTypes = ["Generic", "River", "Lake", "Naval", "Nomadic", "Hunting", "Highland"];

export function open() {
  closeDialogs("#culturesEditor, .stable");
  if (!layerIsOn("toggleCultures")) toggleCultures();
  if (layerIsOn("toggleStates")) toggleStates();
  if (layerIsOn("toggleBiomes")) toggleBiomes();
  if (layerIsOn("toggleReligions")) toggleReligions();
  if (layerIsOn("toggleProvinces")) toggleProvinces();

  refreshCulturesEditor();

  $("#culturesEditor").dialog({
    title: "Cultures Editor",
    resizable: false,
    width: fitContent(),
    close: closeCulturesEditor,
    position: {my: "right top", at: "right-10 top+10", of: "svg"}
  });
  body.focus();
}

function insertEditorHtml() {
  const editorHtml = /* html */ `<div id="culturesEditor" class="dialog stable" style="display: none">
    <div id="culturesHeader" class="header">
      <div style="left: 1.8em" data-tip="Click to sort by culture name" class="sortable alphabetically" data-sortby="name">Culture&nbsp;</div>
      <div style="left: 9.9em" data-tip="Click to sort by type" class="sortable alphabetically" data-sortby="type">Type&nbsp;</div>
      <div style="left: 16.2em" data-tip="Click to sort by culture namesbase" class="sortable" data-sortby="base">Namesbase&nbsp;</div>
      <div style="left: 24.5em" data-tip="Click to sort by culture cells count" class="sortable hide" data-sortby="cells">Cells&nbsp;</div>
      <div style="left: 29.8em" data-tip="Click to sort by expansionism" class="sortable hide" data-sortby="expansionism">Expansion&nbsp;</div>
      <div style="left: 37.2em" data-tip="Click to sort by culture area" class="sortable hide" data-sortby="area">Area&nbsp;</div>
      <div style="left: 42.8em" data-tip="Click to sort by culture population" class="sortable hide icon-sort-number-down" data-sortby="population">Population&nbsp;</div>
      <div style="left: 50.8em" data-tip="Click to sort by culture emblems shape" class="sortable alphabetically hide" data-sortby="emblems">Emblems&nbsp;</div>
    </div>
    <div id="culturesBody" class="table" data-type="absolute"></div>

    <div id="culturesFooter" class="totalLine">
      <div data-tip="Cultures number" style="margin-left: 12px">Cultures:&nbsp;<span id="culturesFooterCultures">0</span></div>
      <div data-tip="Total land cells number" style="margin-left: 12px">Cells:&nbsp;<span id="culturesFooterCells">0</span></div>
      <div data-tip="Total land area" style="margin-left: 12px">Land Area:&nbsp;<span id="culturesFooterArea">0</span></div>
      <div data-tip="Total population" style="margin-left: 12px">Population:&nbsp;<span id="culturesFooterPopulation">0</span></div>
    </div>

    <div id="culturesBottom">
      <button id="culturesEditorRefresh" data-tip="Refresh the Editor" class="icon-cw"></button>
      <button id="culturesEditStyle" data-tip="Edit cultures style in Style Editor" class="icon-adjust"></button>
      <button id="culturesLegend" data-tip="Toggle Legend box" class="icon-list-bullet"></button>
      <button id="culturesPercentage" data-tip="Toggle percentage / absolute values display mode" class="icon-percent"></button>
      <button id="culturesHeirarchy" data-tip="Show cultures hierarchy tree" class="icon-sitemap"></button>
      <button id="culturesManually" data-tip="Manually re-assign cultures" class="icon-brush"></button>
      <div id="culturesManuallyButtons" style="display: none">
        <label data-tip="Change brush size. Shortcut: + (increase), – (decrease)" class="italic">Brush size:
          <input
            id="culturesManuallyBrush"
            oninput="tip('Brush size: '+this.value); culturesManuallyBrushNumber.value = this.value"
            type="range"
            min="5"
            max="99"
            value="15"
            style="width: 7em"
          />
          <input
            id="culturesManuallyBrushNumber"
            oninput="tip('Brush size: '+this.value); culturesManuallyBrush.value = this.value"
            type="number"
            min="5"
            max="99"
            value="15"
          /> </label><br />
        <button id="culturesManuallyApply" data-tip="Apply assignment" class="icon-check"></button>
        <button id="culturesManuallyCancel" data-tip="Cancel assignment" class="icon-cancel"></button>
      </div>
      <button id="culturesEditNamesBase" data-tip="Edit a database used for names generation" class="icon-font"></button>
      <button id="culturesAdd" data-tip="Add a new culture. Hold Shift to add multiple" class="icon-plus"></button>
      <button id="culturesExport" data-tip="Download cultures-related data" class="icon-download"></button>
      <button id="culturesImport" data-tip="Upload cultures-related data" class="icon-upload"></button>
      <button id="culturesRecalculate" data-tip="Recalculate cultures based on current values of growth-related attributes" class="icon-retweet"></button>
      <span data-tip="Allow culture centers, expansion and type changes to take an immediate effect">
        <input id="culturesAutoChange" class="checkbox" type="checkbox" />
        <label for="culturesAutoChange" class="checkbox-label"><i>auto-apply changes</i></label>
      </span>
    </div>
  </div>`;

  const dialogs = document.getElementById("dialogs");
  dialogs.insertAdjacentHTML("beforeend", editorHtml);

  return document.getElementById("culturesBody");
}

function addListeners() {
  applySortingByHeader("culturesHeader");

  document.getElementById("culturesEditorRefresh").addEventListener("click", refreshCulturesEditor);
  document.getElementById("culturesEditStyle").addEventListener("click", () => editStyle("cults"));
  document.getElementById("culturesLegend").addEventListener("click", toggleLegend);
  document.getElementById("culturesPercentage").addEventListener("click", togglePercentageMode);
  document.getElementById("culturesHeirarchy").addEventListener("click", showHierarchy);
  document.getElementById("culturesRecalculate").addEventListener("click", () => recalculateCultures(true));
  document.getElementById("culturesManually").addEventListener("click", enterCultureManualAssignent);
  document.getElementById("culturesManuallyApply").addEventListener("click", applyCultureManualAssignent);
  document.getElementById("culturesManuallyCancel").addEventListener("click", () => exitCulturesManualAssignment());
  document.getElementById("culturesEditNamesBase").addEventListener("click", editNamesbase);
  document.getElementById("culturesAdd").addEventListener("click", enterAddCulturesMode);
  document.getElementById("culturesExport").addEventListener("click", downloadCulturesData);
  document.getElementById("culturesImport").addEventListener("click", () => document.getElementById("culturesCSVToLoad").click());
  document.getElementById("culturesCSVToLoad").addEventListener("change", uploadCulturesData);
}

function refreshCulturesEditor() {
  culturesCollectStatistics();
  culturesEditorAddLines();
  drawCultureCenters();
}

function culturesCollectStatistics() {
  const {cells, cultures, burgs} = pack;
  cultures.forEach(c => (c.cells = c.area = c.rural = c.urban = 0));

  for (const i of cells.i) {
    if (cells.h[i] < 20) continue;
    const cultureId = cells.culture[i];
    cultures[cultureId].cells += 1;
    cultures[cultureId].area += cells.area[i];
    cultures[cultureId].rural += cells.pop[i];
    const burgId = cells.burg[i];
    if (burgId) cultures[cultureId].urban += burgs[burgId].population;
  }
}

function culturesEditorAddLines() {
  const unit = getAreaUnit();
  let lines = "";
  let totalArea = 0;
  let totalPopulation = 0;

  const emblemShapeGroup = document.getElementById("emblemShape")?.selectedOptions[0]?.parentNode?.label;
  const selectShape = emblemShapeGroup === "Diversiform";

  for (const c of pack.cultures) {
    if (c.removed) continue;
    const area = getArea(c.area);
    const rural = c.rural * populationRate;
    const urban = c.urban * populationRate * urbanization;
    const population = rn(rural + urban);
    const populationTip = `Total population: ${si(population)}; Rural population: ${si(rural)}; Urban population: ${si(urban)}. Click to edit`;
    totalArea += area;
    totalPopulation += population;

    if (!c.i) {
      // Uncultured (neutral) line
      lines += /* html */ `<div
          class="states"
          data-id=${c.i}
          data-name="${c.name}"
          data-color=""
          data-cells=${c.cells}
          data-area=${area}
          data-population=${population}
          data-base=${c.base}
          data-type=""
          data-expansionism=""
          data-emblems="${c.shield}"
        >
          <svg width="11" height="11" class="placeholder"></svg>
          <input data-tip="Neutral culture name. Click and type to change" class="cultureName italic" style="width: 7em"
            value="${c.name}" autocorrect="off" spellcheck="false" />
          <span class="icon-cw placeholder"></span>
          <select class="cultureType placeholder">${getTypeOptions(c.type)}</select>
          <select data-tip="Culture namesbase. Click to change. Click on arrows to re-generate names" class="cultureBase">${getBaseOptions(c.base)}</select>
          <span data-tip="Cells count" class="icon-check-empty hide"></span>
          <div data-tip="Cells count" class="cultureCells hide" style="width: 4em">${c.cells}</div>
          <span class="icon-resize-full placeholder hide"></span>
          <input class="cultureExpan placeholder hide" type="number" />
          <span data-tip="Culture area" style="padding-right: 4px" class="icon-map-o hide"></span>
          <div data-tip="Culture area" class="cultureArea hide" style="width: 6em">${si(area)} ${unit}</div>
          <span data-tip="${populationTip}" class="icon-male hide"></span>
          <div data-tip="${populationTip}" class="culturePopulation hide pointer" style="width: 5em">${si(population)}</div>
          <span data-tip="Click to re-generate names for burgs with this culture assigned" class="icon-arrows-cw hide"></span>
          ${getShapeOptions(selectShape, c.shield)}
        </div>`;
      continue;
    }

    lines += /* html */ `<div
        class="states cultures"
        data-id=${c.i}
        data-name="${c.name}"
        data-color="${c.color}"
        data-cells=${c.cells}
        data-area=${area}
        data-population=${population}
        data-base=${c.base}
        data-type=${c.type}
        data-expansionism=${c.expansionism}
        data-emblems="${c.shield}"
      >
        <fill-box fill="${c.color}"></fill-box>
        <input data-tip="Culture name. Click and type to change" class="cultureName" style="width: 7em"
          value="${c.name}" autocorrect="off" spellcheck="false" />
        <span data-tip="Regenerate culture name" class="icon-cw hiddenIcon" style="visibility: hidden"></span>
        <select data-tip="Culture type. Defines growth model. Click to change" class="cultureType">${getTypeOptions(c.type)}</select>
        <select data-tip="Culture namesbase. Click to change. Click on arrows to re-generate names" class="cultureBase">${getBaseOptions(c.base)}</select>
        <span data-tip="Cells count" class="icon-check-empty hide"></span>
        <div data-tip="Cells count" class="cultureCells hide" style="width: 4em">${c.cells}</div>
        <span data-tip="Culture expansionism. Defines competitive size" class="icon-resize-full hide"></span>
        <input
          data-tip="Culture expansionism. Defines competitive size. Click to change, then click Recalculate to apply change"
          class="cultureExpan hide"
          type="number"
          min="0"
          max="99"
          step=".1"
          value=${c.expansionism}
        />
        <span data-tip="Culture area" style="padding-right: 4px" class="icon-map-o hide"></span>
        <div data-tip="Culture area" class="cultureArea hide" style="width: 6em">${si(area)} ${unit}</div>
        <span data-tip="${populationTip}" class="icon-male hide"></span>
        <div data-tip="${populationTip}" class="culturePopulation hide pointer" style="width: 5em">${si(population)}</div>
        <span data-tip="Click to re-generate names for burgs with this culture assigned" class="icon-arrows-cw hide"></span>
        ${getShapeOptions(selectShape, c.shield)}
        <span data-tip="Remove culture" class="icon-trash-empty hide"></span>
      </div>`;
  }
  body.innerHTML = lines;

  // update footer
  document.getElementById("culturesFooterCultures").innerHTML = pack.cultures.filter(c => c.i && !c.removed).length;
  document.getElementById("culturesFooterCells").innerHTML = pack.cells.h.filter(h => h >= 20).length;
  document.getElementById("culturesFooterArea").innerHTML = `${si(totalArea)} ${unit}`;
  document.getElementById("culturesFooterPopulation").innerHTML = si(totalPopulation);
  document.getElementById("culturesFooterArea").dataset.area = totalArea;
  document.getElementById("culturesFooterPopulation").dataset.population = totalPopulation;

  // add listeners
  body.querySelectorAll("div.cultures").forEach(el => el.addEventListener("mouseenter", cultureHighlightOn));
  body.querySelectorAll("div.cultures").forEach(el => el.addEventListener("mouseleave", cultureHighlightOff));
  body.querySelectorAll("div.states").forEach(el => el.addEventListener("click", selectCultureOnLineClick));
  body.querySelectorAll("fill-box").forEach(el => el.addEventListener("click", cultureChangeColor));
  body.querySelectorAll("div > input.cultureName").forEach(el => el.addEventListener("input", cultureChangeName));
  body.querySelectorAll("div > span.icon-cw").forEach(el => el.addEventListener("click", cultureRegenerateName));
  body.querySelectorAll("div > input.cultureExpan").forEach(el => el.addEventListener("input", cultureChangeExpansionism));
  body.querySelectorAll("div > select.cultureType").forEach(el => el.addEventListener("change", cultureChangeType));
  body.querySelectorAll("div > select.cultureBase").forEach(el => el.addEventListener("change", cultureChangeBase));
  body.querySelectorAll("div > select.cultureEmblems").forEach(el => el.addEventListener("change", cultureChangeEmblemsShape));
  body.querySelectorAll("div > div.culturePopulation").forEach(el => el.addEventListener("click", changePopulation));
  body.querySelectorAll("div > span.icon-arrows-cw").forEach(el => el.addEventListener("click", cultureRegenerateBurgs));
  body.querySelectorAll("div > span.icon-trash-empty").forEach(el => el.addEventListener("click", cultureRemove));

  culturesHeader.querySelector("div[data-sortby='emblems']").style.display = selectShape ? "inline-block" : "none";

  if (body.dataset.type === "percentage") {
    body.dataset.type = "absolute";
    togglePercentageMode();
  }
  applySorting(culturesHeader);
  $("#culturesEditor").dialog({width: fitContent()});
}

function getTypeOptions(type) {
  let options = "";
  cultureTypes.forEach(t => (options += `<option ${type === t ? "selected" : ""} value="${t}">${t}</option>`));
  return options;
}

function getBaseOptions(base) {
  let options = "";
  nameBases.forEach((n, i) => (options += `<option ${base === i ? "selected" : ""} value="${i}">${n.name}</option>`));
  return options;
}

function getShapeOptions(selectShape, selected) {
  if (!selectShape) return "";

  const shapes = Object.keys(COA.shields.types)
    .map(type => Object.keys(COA.shields[type]))
    .flat();
  const options = shapes.map(shape => `<option ${shape === selected ? "selected" : ""} value="${shape}">${capitalize(shape)}</option>`);
  return `<select data-tip="Emblem shape associated with culture. Click to change" class="cultureEmblems hide">${options}</select>`;
}

function cultureHighlightOn(event) {
  const culture = +event.target.dataset.id;
  const info = document.getElementById("cultureInfo");
  if (info) {
    d3.select("#hierarchy")
      .select("g[data-id='" + culture + "'] > path")
      .classed("selected", 1);
    const c = pack.cultures[culture];
    const rural = c.rural * populationRate;
    const urban = c.urban * populationRate * urbanization;
    const population = rural + urban > 0 ? si(rn(rural + urban)) + " people" : "Extinct";
    info.innerHTML = `${c.name} culture. ${c.type}. ${population}`;
    tip("Drag to change parent, drag to itself to move to the top level. Hold CTRL and click to change abbreviation");
  }

  if (!layerIsOn("toggleCultures")) return;
  if (customization) return;

  const animate = d3.transition().duration(2000).ease(d3.easeSinIn);
  cults
    .select("#culture" + culture)
    .raise()
    .transition(animate)
    .attr("stroke-width", 2.5)
    .attr("stroke", "#d0240f");
  debug
    .select("#cultureCenter" + culture)
    .raise()
    .transition(animate)
    .attr("r", 8)
    .attr("stroke", "#d0240f");
}

function cultureHighlightOff(event) {
  const culture = +event.target.dataset.id;
  const info = document.getElementById("cultureInfo");
  if (info) {
    d3.select("#hierarchy")
      .select("g[data-id='" + culture + "'] > path")
      .classed("selected", 0);
    info.innerHTML = "&#8205;";
    tip("");
  }

  if (!layerIsOn("toggleCultures")) return;
  cults
    .select("#culture" + culture)
    .transition()
    .attr("stroke-width", null)
    .attr("stroke", null);
  debug
    .select("#cultureCenter" + culture)
    .transition()
    .attr("r", 6)
    .attr("stroke", null);
}

function cultureChangeColor() {
  const el = this;
  const currentFill = el.getAttribute("fill");
  const culture = +el.parentNode.dataset.id;

  const callback = newFill => {
    el.fill = newFill;
    pack.cultures[culture].color = newFill;
    cults
      .select("#culture" + culture)
      .attr("fill", newFill)
      .attr("stroke", newFill);
    debug.select("#cultureCenter" + culture).attr("fill", newFill);
  };

  openPicker(currentFill, callback);
}

function cultureChangeName() {
  const culture = +this.parentNode.dataset.id;
  this.parentNode.dataset.name = this.value;
  pack.cultures[culture].name = this.value;
  pack.cultures[culture].code = abbreviate(
    this.value,
    pack.cultures.map(c => c.code)
  );
}

function cultureRegenerateName() {
  const culture = +this.parentNode.dataset.id;
  const name = Names.getCultureShort(culture);
  this.parentNode.querySelector("input.cultureName").value = name;
  pack.cultures[culture].name = name;
}

function cultureChangeExpansionism() {
  const culture = +this.parentNode.dataset.id;
  this.parentNode.dataset.expansionism = this.value;
  pack.cultures[culture].expansionism = +this.value;
  recalculateCultures();
}

function cultureChangeType() {
  const culture = +this.parentNode.dataset.id;
  this.parentNode.dataset.type = this.value;
  pack.cultures[culture].type = this.value;
  recalculateCultures();
}

function cultureChangeBase() {
  const culture = +this.parentNode.dataset.id;
  const v = +this.value;
  this.parentNode.dataset.base = pack.cultures[culture].base = v;
}

function cultureChangeEmblemsShape() {
  const culture = +this.parentNode.dataset.id;
  const shape = this.value;
  this.parentNode.dataset.emblems = pack.cultures[culture].shield = shape;

  const rerenderCOA = (id, coa) => {
    const coaEl = document.getElementById(id);
    if (!coaEl) return; // not rendered
    coaEl.remove();
    COArenderer.trigger(id, coa);
  };

  pack.states.forEach(state => {
    if (state.culture !== culture || !state.i || state.removed || !state.coa || state.coa === "custom") return;
    if (shape === state.coa.shield) return;
    state.coa.shield = shape;
    rerenderCOA("stateCOA" + state.i, state.coa);
  });

  pack.provinces.forEach(province => {
    if (pack.cells.culture[province.center] !== culture || !province.i || province.removed || !province.coa || province.coa === "custom") return;
    if (shape === province.coa.shield) return;
    province.coa.shield = shape;
    rerenderCOA("provinceCOA" + province.i, province.coa);
  });

  pack.burgs.forEach(burg => {
    if (burg.culture !== culture || !burg.i || burg.removed || !burg.coa || burg.coa === "custom") return;
    if (shape === burg.coa.shield) return;
    burg.coa.shield = shape;
    rerenderCOA("burgCOA" + burg.i, burg.coa);
  });
}

function changePopulation() {
  const cultureId = +this.parentNode.dataset.id;
  const culture = pack.cultures[cultureId];
  if (!culture.cells) return tip("Culture does not have any cells, cannot change population", false, "error");

  const rural = rn(culture.rural * populationRate);
  const urban = rn(culture.urban * populationRate * urbanization);
  const total = rural + urban;
  const l = n => Number(n).toLocaleString();
  const burgs = pack.burgs.filter(b => !b.removed && b.culture === cultureId);

  alertMessage.innerHTML = /* html */ `Rural: <input type="number" min="0" step="1" id="ruralPop" value=${rural} style="width:6em" /> Urban:
      <input type="number" min="0" step="1" id="urbanPop" value=${urban} style="width:6em" ${burgs.length ? "" : "disabled"} />
      <p>Total population: ${l(total)} ⇒ <span id="totalPop">${l(total)}</span> (<span id="totalPopPerc">100</span>%)</p>`;

  const update = function () {
    const totalNew = ruralPop.valueAsNumber + urbanPop.valueAsNumber;
    if (isNaN(totalNew)) return;
    totalPop.innerHTML = l(totalNew);
    totalPopPerc.innerHTML = rn((totalNew / total) * 100);
  };

  ruralPop.oninput = () => update();
  urbanPop.oninput = () => update();

  $("#alert").dialog({
    resizable: false,
    title: "Change culture population",
    width: "24em",
    buttons: {
      Apply: function () {
        applyPopulationChange(rural, urban, ruralPop.value, urbanPop.value, cultureId);
        $(this).dialog("close");
      },
      Cancel: function () {
        $(this).dialog("close");
      }
    },
    position: {my: "center", at: "center", of: "svg"}
  });
}

function applyPopulationChange(oldRural, oldUrban, newRural, newUrban, culture) {
  const ruralChange = newRural / oldRural;
  if (isFinite(ruralChange) && ruralChange !== 1) {
    const cells = pack.cells.i.filter(i => pack.cells.culture[i] === culture);
    cells.forEach(i => (pack.cells.pop[i] *= ruralChange));
  }
  if (!isFinite(ruralChange) && +newRural > 0) {
    const points = newRural / populationRate;
    const cells = pack.cells.i.filter(i => pack.cells.culture[i] === culture);
    const pop = rn(points / cells.length);
    cells.forEach(i => (pack.cells.pop[i] = pop));
  }

  const burgs = pack.burgs.filter(b => !b.removed && b.culture === culture);
  const urbanChange = newUrban / oldUrban;
  if (isFinite(urbanChange) && urbanChange !== 1) {
    burgs.forEach(b => (b.population = rn(b.population * urbanChange, 4)));
  }
  if (!isFinite(urbanChange) && +newUrban > 0) {
    const points = newUrban / populationRate / urbanization;
    const population = rn(points / burgs.length, 4);
    burgs.forEach(b => (b.population = population));
  }

  refreshCulturesEditor();
}

function cultureRegenerateBurgs() {
  if (customization === 4) return;

  const cultureId = +this.parentNode.dataset.id;
  const cBurgs = pack.burgs.filter(b => b.culture === cultureId && !b.lock);
  cBurgs.forEach(b => {
    b.name = Names.getCulture(cultureId);
    labels.select("[data-id='" + b.i + "']").text(b.name);
  });
  tip(`Names for ${cBurgs.length} burgs are regenerated`, false, "success");
}

function removeCulture(cultureId) {
  cults.select("#culture" + cultureId).remove();
  debug.select("#cultureCenter" + cultureId).remove();

  const {burgs, states, cells, cultures} = pack;

  burgs.filter(b => b.culture == cultureId).forEach(b => (b.culture = 0));
  states.forEach(s => {
    if (s.culture === cultureId) s.culture = 0;
  });
  cells.culture.forEach((c, i) => {
    if (c === cultureId) cells.culture[i] = 0;
  });
  cultures[cultureId].removed = true;

  const origin = cultures[cultureId].origin;
  cultures.forEach(c => {
    if (c.origin === cultureId) c.origin = origin;
  });
  refreshCulturesEditor();
}

function cultureRemove() {
  if (customization === 4) return;
  const cultureId = +this.parentNode.dataset.id;

  alertMessage.innerHTML = "Are you sure you want to remove the culture? <br>This action cannot be reverted";
  $("#alert").dialog({
    resizable: false,
    title: "Remove culture",
    buttons: {
      Remove: function () {
        removeCulture(cultureId);
        $(this).dialog("close");
      },
      Cancel: function () {
        $(this).dialog("close");
      }
    }
  });
}

function drawCultureCenters() {
  const tooltip = "Drag to move the culture center (ancestral home)";
  debug.select("#cultureCenters").remove();
  const cultureCenters = debug.append("g").attr("id", "cultureCenters").attr("stroke-width", 2).attr("stroke", "#444444").style("cursor", "move");

  const data = pack.cultures.filter(c => c.i && !c.removed);
  cultureCenters
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("id", d => "cultureCenter" + d.i)
    .attr("data-id", d => d.i)
    .attr("r", 6)
    .attr("fill", d => d.color)
    .attr("cx", d => pack.cells.p[d.center][0])
    .attr("cy", d => pack.cells.p[d.center][1])
    .on("mouseenter", d => {
      tip(tooltip, true);
      body.querySelector(`div[data-id='${d.i}']`).classList.add("selected");
      cultureHighlightOn(event);
    })
    .on("mouseleave", d => {
      tip("", true);
      body.querySelector(`div[data-id='${d.i}']`).classList.remove("selected");
      cultureHighlightOff(event);
    })
    .call(d3.drag().on("start", cultureCenterDrag));
}

function cultureCenterDrag() {
  const el = d3.select(this);
  const c = +this.id.slice(13);
  d3.event.on("drag", () => {
    el.attr("cx", d3.event.x).attr("cy", d3.event.y);
    const cell = findCell(d3.event.x, d3.event.y);
    if (pack.cells.h[cell] < 20) return; // ignore dragging on water
    pack.cultures[c].center = cell;
    recalculateCultures();
  });
}

function toggleLegend() {
  if (legend.selectAll("*").size()) {
    clearLegend();
    return;
  } // hide legend
  const data = pack.cultures
    .filter(c => c.i && !c.removed && c.cells)
    .sort((a, b) => b.area - a.area)
    .map(c => [c.i, c.color, c.name]);
  drawLegend("Cultures", data);
}

function togglePercentageMode() {
  if (body.dataset.type === "absolute") {
    body.dataset.type = "percentage";
    const totalCells = +culturesFooterCells.innerHTML;
    const totalArea = +culturesFooterArea.dataset.area;
    const totalPopulation = +culturesFooterPopulation.dataset.population;

    body.querySelectorAll(":scope > div").forEach(function (el) {
      el.querySelector(".cultureCells").innerHTML = rn((+el.dataset.cells / totalCells) * 100) + "%";
      el.querySelector(".cultureArea").innerHTML = rn((+el.dataset.area / totalArea) * 100) + "%";
      el.querySelector(".culturePopulation").innerHTML = rn((+el.dataset.population / totalPopulation) * 100) + "%";
    });
  } else {
    body.dataset.type = "absolute";
    culturesEditorAddLines();
  }
}

function showHierarchy() {
  // build hierarchy tree
  pack.cultures[0].origin = null;
  const validCultures = pack.cultures.filter(c => !c.removed);
  if (validCultures.length < 3) return tip("Not enough cultures to show hierarchy", false, "error");

  const root = d3
    .stratify()
    .id(d => d.i)
    .parentId(d => d.origin)(validCultures);
  const treeWidth = root.leaves().length;
  const treeHeight = root.height;
  const width = treeWidth * 40;
  const height = treeHeight * 60;

  const margin = {top: 10, right: 10, bottom: -5, left: 10};
  const w = width - margin.left - margin.right;
  const h = height + 30 - margin.top - margin.bottom;
  const treeLayout = d3.tree().size([w, h]);

  // prepare svg
  alertMessage.innerHTML = "<div id='cultureInfo' class='chartInfo'>&#8205;</div>";
  const svg = d3
    .select("#alertMessage")
    .insert("svg", "#cultureInfo")
    .attr("id", "hierarchy")
    .attr("width", width)
    .attr("height", height)
    .style("text-anchor", "middle");
  const graph = svg.append("g").attr("transform", `translate(10, -45)`);
  const links = graph.append("g").attr("fill", "none").attr("stroke", "#aaaaaa");
  const nodes = graph.append("g");

  renderTree();
  function renderTree() {
    treeLayout(root);
    links
      .selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .attr("d", d => {
        return (
          "M" +
          d.source.x +
          "," +
          d.source.y +
          "C" +
          d.source.x +
          "," +
          (d.source.y * 3 + d.target.y) / 4 +
          " " +
          d.target.x +
          "," +
          (d.source.y * 2 + d.target.y) / 3 +
          " " +
          d.target.x +
          "," +
          d.target.y
        );
      });

    const node = nodes
      .selectAll("g")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("data-id", d => d.data.i)
      .attr("stroke", "#333333")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .on("mouseenter", () => cultureHighlightOn(event))
      .on("mouseleave", () => cultureHighlightOff(event))
      .call(d3.drag().on("start", d => dragToReorigin(d)));

    node
      .append("path")
      .attr("d", d => {
        if (!d.data.i) return "M5,0A5,5,0,1,1,-5,0A5,5,0,1,1,5,0";
        // small circle
        else if (d.data.type === "Generic") return "M11.3,0A11.3,11.3,0,1,1,-11.3,0A11.3,11.3,0,1,1,11.3,0";
        // circle
        else if (d.data.type === "River") return "M0,-14L14,0L0,14L-14,0Z";
        // diamond
        else if (d.data.type === "Lake") return "M-6.5,-11.26l13,0l6.5,11.26l-6.5,11.26l-13,0l-6.5,-11.26Z";
        // hexagon
        else if (d.data.type === "Naval") return "M-11,-11h22v22h-22Z"; // square
        if (d.data.type === "Highland") return "M-11,-11l11,2l11,-2l-2,11l2,11l-11,-2l-11,2l2,-11Z"; // concave square
        if (d.data.type === "Nomadic") return "M-4.97,-12.01 l9.95,0 l7.04,7.04 l0,9.95 l-7.04,7.04 l-9.95,0 l-7.04,-7.04 l0,-9.95Z"; // octagon
        if (d.data.type === "Hunting") return "M0,-14l14,11l-6,14h-16l-6,-14Z"; // pentagon
        return "M-11,-11h22v22h-22Z"; // square
      })
      .attr("fill", d => (d.data.i ? d.data.color : "#ffffff"))
      .attr("stroke-dasharray", d => (d.data.cells ? "null" : "1"));

    node
      .append("text")
      .attr("dy", ".35em")
      .text(d => (d.data.i ? d.data.code : ""));
  }

  $("#alert").dialog({
    title: "Cultures tree",
    width: fitContent(),
    resizable: false,
    position: {my: "left center", at: "left+10 center", of: "svg"},
    buttons: {},
    close: () => {
      alertMessage.innerHTML = "";
    }
  });

  function dragToReorigin(d) {
    if (isCtrlClick(d3.event.sourceEvent)) return changeCode(d);

    const originLine = graph.append("path").attr("class", "dragLine").attr("d", `M${d.x},${d.y}L${d.x},${d.y}`);

    d3.event.on("drag", () => {
      originLine.attr("d", `M${d.x},${d.y}L${d3.event.x},${d3.event.y}`);
    });

    d3.event.on("end", () => {
      originLine.remove();
      const selected = graph.select("path.selected");
      if (!selected.size()) return;
      const culture = d.data.i;
      const oldOrigin = d.data.origin;
      let newOrigin = selected.datum().data.i;
      if (newOrigin == oldOrigin) return; // already a child of the selected node
      if (newOrigin == culture) newOrigin = 0; // move to top
      if (newOrigin && d.descendants().some(node => node.id == newOrigin)) return; // cannot be a child of its own child
      pack.cultures[culture].origin = d.data.origin = newOrigin; // change data
      showHierarchy(); // update hierarchy
    });
  }

  function changeCode(d) {
    prompt(`Please provide an abbreviation for culture: ${d.data.name}`, {default: d.data.code}, v => {
      pack.cultures[d.data.i].code = v;
      nodes
        .select("g[data-id='" + d.data.i + "']")
        .select("text")
        .text(v);
    });
  }
}

function recalculateCultures(must) {
  if (!must && !culturesAutoChange.checked) return;

  pack.cells.culture = new Uint16Array(pack.cells.i.length);
  pack.cultures.forEach(function (c) {
    if (!c.i || c.removed) return;
    pack.cells.culture[c.center] = c.i;
  });

  Cultures.expand();
  drawCultures();
  pack.burgs.forEach(b => (b.culture = pack.cells.culture[b.cell]));
  refreshCulturesEditor();
  document.querySelector("input.cultureExpan").focus(); // to not trigger hotkeys
}

function enterCultureManualAssignent() {
  if (!layerIsOn("toggleCultures")) toggleCultures();
  customization = 4;
  cults.append("g").attr("id", "temp");
  document.querySelectorAll("#culturesBottom > *").forEach(el => (el.style.display = "none"));
  document.getElementById("culturesManuallyButtons").style.display = "inline-block";
  debug.select("#cultureCenters").style("display", "none");

  culturesEditor.querySelectorAll(".hide").forEach(el => el.classList.add("hidden"));
  culturesFooter.style.display = "none";
  body.querySelectorAll("div > input, select, span, svg").forEach(e => (e.style.pointerEvents = "none"));
  $("#culturesEditor").dialog({position: {my: "right top", at: "right-10 top+10", of: "svg"}});

  tip("Click on culture to select, drag the circle to change culture", true);
  viewbox
    .style("cursor", "crosshair")
    .on("click", selectCultureOnMapClick)
    .call(d3.drag().on("start", dragCultureBrush))
    .on("touchmove mousemove", moveCultureBrush);

  body.querySelector("div").classList.add("selected");
}

function selectCultureOnLineClick(i) {
  if (customization !== 4) return;
  body.querySelector("div.selected").classList.remove("selected");
  this.classList.add("selected");
}

function selectCultureOnMapClick() {
  const point = d3.mouse(this);
  const i = findCell(point[0], point[1]);
  if (pack.cells.h[i] < 20) return;

  const assigned = cults.select("#temp").select("polygon[data-cell='" + i + "']");
  const culture = assigned.size() ? +assigned.attr("data-culture") : pack.cells.culture[i];

  body.querySelector("div.selected").classList.remove("selected");
  body.querySelector("div[data-id='" + culture + "']").classList.add("selected");
}

function dragCultureBrush() {
  const radius = +culturesManuallyBrush.value;

  d3.event.on("drag", () => {
    if (!d3.event.dx && !d3.event.dy) return;
    const p = d3.mouse(this);
    moveCircle(p[0], p[1], radius);

    const found = radius > 5 ? findAll(p[0], p[1], radius) : [findCell(p[0], p[1], radius)];
    const selection = found.filter(isLand);
    if (selection) changeCultureForSelection(selection);
  });
}

function changeCultureForSelection(selection) {
  const temp = cults.select("#temp");
  const selected = body.querySelector("div.selected");

  const cultureNew = +selected.dataset.id;
  const color = pack.cultures[cultureNew].color || "#ffffff";

  selection.forEach(function (i) {
    const exists = temp.select("polygon[data-cell='" + i + "']");
    const cultureOld = exists.size() ? +exists.attr("data-culture") : pack.cells.culture[i];
    if (cultureNew === cultureOld) return;

    // change of append new element
    if (exists.size()) exists.attr("data-culture", cultureNew).attr("fill", color).attr("stroke", color);
    else
      temp.append("polygon").attr("data-cell", i).attr("data-culture", cultureNew).attr("points", getPackPolygon(i)).attr("fill", color).attr("stroke", color);
  });
}

function moveCultureBrush() {
  showMainTip();
  const point = d3.mouse(this);
  const radius = +culturesManuallyBrush.value;
  moveCircle(point[0], point[1], radius);
}

function applyCultureManualAssignent() {
  const changed = cults.select("#temp").selectAll("polygon");
  changed.each(function () {
    const i = +this.dataset.cell;
    const c = +this.dataset.culture;
    pack.cells.culture[i] = c;
    if (pack.cells.burg[i]) pack.burgs[pack.cells.burg[i]].culture = c;
  });

  if (changed.size()) {
    drawCultures();
    refreshCulturesEditor();
  }
  exitCulturesManualAssignment();
}

function exitCulturesManualAssignment(close) {
  customization = 0;
  cults.select("#temp").remove();
  removeCircle();
  document.querySelectorAll("#culturesBottom > *").forEach(el => (el.style.display = "inline-block"));
  document.getElementById("culturesManuallyButtons").style.display = "none";

  culturesEditor.querySelectorAll(".hide").forEach(el => el.classList.remove("hidden"));
  culturesFooter.style.display = "block";
  body.querySelectorAll("div > input, select, span, svg").forEach(e => (e.style.pointerEvents = "all"));
  if (!close) $("#culturesEditor").dialog({position: {my: "right top", at: "right-10 top+10", of: "svg"}});

  debug.select("#cultureCenters").style("display", null);
  restoreDefaultEvents();
  clearMainTip();
  const selected = body.querySelector("div.selected");
  if (selected) selected.classList.remove("selected");
}

function enterAddCulturesMode() {
  if (this.classList.contains("pressed")) return exitAddCultureMode();

  customization = 9;
  this.classList.add("pressed");
  tip("Click on the map to add a new culture", true);
  viewbox.style("cursor", "crosshair").on("click", addCulture);
  body.querySelectorAll("div > input, select, span, svg").forEach(e => (e.style.pointerEvents = "none"));
}

function exitAddCultureMode() {
  customization = 0;
  restoreDefaultEvents();
  clearMainTip();
  body.querySelectorAll("div > input, select, span, svg").forEach(e => (e.style.pointerEvents = "all"));
  if (culturesAdd.classList.contains("pressed")) culturesAdd.classList.remove("pressed");
}

function addCulture() {
  const point = d3.mouse(this);
  const center = findCell(point[0], point[1]);

  if (pack.cells.h[center] < 20) return tip("You cannot place culture center into the water. Please click on a land cell", false, "error");
  const occupied = pack.cultures.some(c => !c.removed && c.center === center);
  if (occupied) return tip("This cell is already a culture center. Please select a different cell", false, "error");

  if (d3.event.shiftKey === false) exitAddCultureMode();
  Cultures.add(center);

  drawCultureCenters();
  culturesEditorAddLines();
}

function downloadCulturesData() {
  let data = `Id,Culture,Color,Cells,Expansionism,Type,Area ${getAreaUnit("2")},Population,Namesbase,Emblems Shape,Origin\n`; // headers

  body.querySelectorAll(":scope > div").forEach(function (el) {
    data += el.dataset.id + ",";
    data += el.dataset.name + ",";
    data += el.dataset.color + ",";
    data += el.dataset.cells + ",";
    data += el.dataset.expansionism + ",";
    data += el.dataset.type + ",";
    data += el.dataset.area + ",";
    data += el.dataset.population + ",";
    const base = +el.dataset.base;
    data += nameBases[base].name + ",";
    data += el.dataset.emblems + ",";
    data += pack.cultures[+el.dataset.id].origin + "\n";
  });

  const name = getFileName("Cultures") + ".csv";
  downloadFile(data, name);
}

function closeCulturesEditor() {
  debug.select("#cultureCenters").remove();
  exitCulturesManualAssignment("close");
  exitAddCultureMode();
}

async function uploadCulturesData() {
  const csv = await Formats.csvParser(this.files[0]);
  this.value = "";

  const {cultures, cells} = pack;
  const shapes = Object.keys(COA.shields.types)
    .map(type => Object.keys(COA.shields[type]))
    .flat();

  const populated = cells.pop.map((c, i) => (c ? i : null)).filter(c => c);
  cultures.forEach(item => {
    if (item.i) item.removed = true;
  });

  for (const c of csv.iterator((a, b) => +a[0] > +b[0])) {
    let current;
    if (+c.id < cultures.length) {
      current = cultures[c.id];

      const ratio = current.urban / (current.rural + current.urban);
      applyPopulationChange(current.rural, current.urban, c.population * (1 - ratio), c.population * ratio, +c.id);
    } else {
      current = {i: cultures.length, center: ra(populated), area: 0, cells: 0, origin: 0, rural: 0, urban: 0};
      cultures.push(current);
    }

    current.removed = false;
    current.name = c.culture;
    current.code = abbreviate(
      current.name,
      cultures.map(c => c.code)
    );

    current.color = c.color;
    current.expansionism = +c.expansionism;
    current.origin = +c.origin;

    if (cultureTypes.includes(c.type)) current.type = c.type;
    else current.type = "Generic";

    const shieldShape = c["emblems shape"].toLowerCase();
    if (shapes.includes(shieldShape)) current.shield = shieldShape;
    else current.shield = "heater";

    const nameBaseIndex = nameBases.findIndex(n => n.name == c.namesbase);
    current.base = nameBaseIndex === -1 ? 0 : nameBaseIndex;
  }

  cultures.filter(c => c.removed).forEach(c => removeCulture(c.i));

  drawCultures();
  refreshCulturesEditor();
}
