ko.components.register("product-filter", {
  viewModel: function (params) {
    var self = this;
    self.dataoptions = params.dataoptions;
    self.label = ko.observable(params.label);
    self.id = ko.observable(params.id);
    self.value = params.value;
    self.elementId = function () {
      return "filter-" + self.id();
    };
    self.disabled = ko.computed(function () {
      return params.dataoptions().length == 0;
    });
  },
  template:
    '<div>\
    <select class="form-control" data-bind="disable: disabled, options: dataoptions, optionsCaption: label, value: value"></select>\
</div>' /*
  <!--<input type="text" class="form-control" data-bind="textInput: value, attr: {placeholder: label, list: elementId()}"  />\
       <datalist data-bind="attr: {id: elementId()}">\
      <!-- ko foreach: dataoptions-->\
      <option data-bind="value: $data, text: $data"></option>\
      <!-- /ko -->\
      </datalist>\
-->\
*/
});

var VM_DataResults = function () {
  // ajax etc.etc.
  var self = this;

  self.data = ko.observableArray([]);
  self.update = function (filters, query) {
    var wasFiltered = false;
    var products = window.data.products;

    if (!filters.empty()) {
      products = _.where(products, filters.values());
      wasFiltered = true;
    }

    if (query()) {
      // found query
      var searchTerm = query();

      products = products.filter(function (item) {
        var match = false;
        ["category", "type", "collection", "brand", "title"].forEach(function (
          field
        ) {
          termMatches = item[field]
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          match = match || termMatches;
        });
        return match;
      });
      wasFiltered = true;
    }

    if (!wasFiltered) {
      products = window.data.categories;
    }

    self.data(products);
  };
};

var VM_SearchResult = function (data) {
  var self = this;
  var fields = [
    "caption",
    "image",
    "brand",
    "title",
    "category",
    "collection",
    "type"
  ];

  fields.forEach(function (f) {
    var value = data[f] || "";
    //self[f] = ko.observable(value);
    self[f] = value;
  });

  if (!self.caption) {
    self.caption = self.collection;
  }

  self.isCategory = ko.computed(function () {
    return !self.title || self.title.length == 0;
  });
};

var VM_Filters = function (categories, types, brands, collections) {
  var self = this;

  self.categories = ko.observableArray(categories || []);
  self.types = ko.observableArray(types || []);
  self.brands = ko.observableArray(brands || []);
  self.collections = ko.observableArray(collections || []);
};

var VM_SelectedFilters = function () {
  var self = this;

  self.category = ko.observable("");
  self.type = ko.observable("");
  self.brand = ko.observable("");
  self.collection = ko.observable("");

  self.values = ko.computed(function () {
    var values = {};
    var found = false;
    ["category", "type", "brand", "collection"].forEach(function (obj) {
      if (self[obj]()) {
        values[obj] = self[obj]();
        found = true;
      }
    });

    if (found) {
      return values;
    }

    return false;
  });

  self.empty = ko.computed(function () {
    return !self.values();
  });
};

var VM = function () {
  var self = this;

  self.filters = new VM_Filters();

  self.selectedFilters = new VM_SelectedFilters();

  self.query = ko.observable("");

  self.setFilterData = function (filterName, options) {
    self.filters[filterName](options);
  };

  self.results = new VM_DataResults();

  self.fetchResults = function () {
    self.results.update(self.selectedFilters, self.query);
  };

  self.resetFilters = function () {
    self.query("");
    self.selectedFilters.category("");
  };

  self.updateFilters = function () {
    var selected_category = self.selectedFilters.category();
    if (selected_category) {
      var product_with_category = _.where(window.data.products, {
        category: selected_category
      });
      var brands = _.pluck(product_with_category, "brand");
      self.setFilterData("brands", _.uniq(brands));
    } else {
      self.setFilterData("brands", []);
    }

    var selected_brand = self.selectedFilters.brand();

    if (selected_brand) {
      var product_with_brand = _.where(window.data.products, {
        category: selected_category,
        brand: selected_brand
      });

      var types = _.pluck(product_with_brand, "type");
      self.setFilterData("types", _.uniq(types));
      var collections = _.pluck(product_with_brand, "collection");
      self.setFilterData("collections", _.uniq(collections));
    } else {
      self.setFilterData("collections", []);
      self.setFilterData("types", []);
    }

    // finally fetchResults()
    self.fetchResults();
  };

  self.selectedFilters.category.subscribe(self.updateFilters);
  self.selectedFilters.brand.subscribe(self.updateFilters);
  self.selectedFilters.type.subscribe(self.updateFilters);
  self.selectedFilters.collection.subscribe(self.updateFilters);
  self.query.subscribe(self.fetchResults);
};

window.data = {};
window.data.categories = [
  new VM_SearchResult({
    image: "imgs/warrior-protection.jpg?",
    caption: "Tank"
  }),
  new VM_SearchResult({
    image: "imgs/paladin-holy.jpg?",
    caption: "Healer"
  }),
  new VM_SearchResult({
    image: "imgs/druid-balance.jpg?",
    caption: "Caster DPS"
  }),
  new VM_SearchResult({
    image: "imgs/classic-rogue-combat.jpg?",
    caption: "Physical DPS"
  })
];



 /* 
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/460310847940722708/aae0b96227f36e93cecbf7643584ddf4.png?size=1024",
    caption: "Forcekn"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/196112668589817856/e34c4eca152e93dc9640650c8cdd4513.png?size=1024",
    caption: "Adrekt"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/195513636058300416/f21bddf1dbc26440735f513bd549966c.png?size=1024",
    caption: "Maxington"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/221971474838323210/752d18f014a3f4065e47a293ad8cc2f4.png?size=1024",
    caption: "Dogupya"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/638134012094840832/b14a4bd225463c127df002f2c3df61e4.png?size=1024",
    caption: "Jimbus"
  }),

  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/355220590912733185/0d4ddc261b0fe017a004cd35bb2a8251.png?size=1024",
    caption: "Otty"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/embed/avatars/4.png?",
    caption: "Feloracy"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/207840849021763586/c575a645a10cb34e0a2f7398d501a8a9.png?size=1024",
    caption: "Manofmilk"
  })
];*/

window.data.products = [
  //Mithrin Start
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/181677964725977088/a93dda0660e0c316c4b9aff9182d689c.png?size=1024",
    category: "Healer",
    brand: "Discpline Priest",
    collection: "Main",
    type: "Yes",
    title: "Mahu"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/181677964725977088/a93dda0660e0c316c4b9aff9182d689c.png?size=1024",
    category: "Caster DPS",
    brand: "Shadow Priest",
    collection: "Dualspec",
    type: "No",
    title: "Mahu"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/181677964725977088/a93dda0660e0c316c4b9aff9182d689c.png?size=1024",
    category: "Caster DPS",
    brand: "Arcane Mage",
    collection: "Alt",
    type: "Yes",
    title: "Mythrin"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/181677964725977088/a93dda0660e0c316c4b9aff9182d689c.png?size=1024",
    category: "Physical DPS",
    brand: "MM Hunter",
    collection: "Alt",
    type: "Yes",
    title: "Mithrin"
  }),
  //Mithrin End
  //Cloped Start
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Caster DPS",
    brand: "Arcane Mage",
    collection: "Alt",
    type: "Yes",
    title: "Cloped"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Tank",
    brand: "Prot Warrior",
    collection: "Alt",
    type: "No",
    title: "Wredwiddley"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Physical DPS",
    brand: "MM Hunter",
    collection: "Alt",
    type: "No",
    title: "Madrekt"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Physical DPS",
    brand: "Combat Rogue",
    collection: "Alt",
    type: "No",
    title: "Wredwroguely"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Healer",
    brand: "Holy Paladin",
    collection: "Main",
    type: "Yes",
    title: "Osserc"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Tank",
    brand: "Prot Paladin",
    collection: "Dualspec",
    type: "Yes",
    title: "Osserc"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Healer",
    brand: "Resto Druid",
    collection: "Alt",
    type: "Yes",
    title: "Messremb"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Healer",
    brand: "Resto Shaman",
    collection: "Alt",
    type: "Yes",
    title: "Starlorde"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/200974827647926272/02a546a4d454e47c05139a7f3248c037.png?size=1024",
    category: "Healer",
    brand: "Holy Priest",
    collection: "Alt",
    type: "No",
    title: "Achamien"
  }),
  //Cloped End
  //Healls Start
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Caster DPS",
    brand: "Elemental Shaman",
    collection: "Main",
    type: "Yes",
    title: "Healls"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Healer",
    brand: "Resto Shaman",
    collection: "Dualspec",
    type: "No",
    title: "Healls"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Tank",
    brand: "Blood Death Knight",
    collection: "Alt",
    type: "Yes",
    title: "Nohealls"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Caster DPS",
    brand: "Destruction Warlock",
    collection: "Alt",
    type: "Yes",
    title: "Klapps"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Caster DPS",
    brand: "Frost Mage",
    collection: "Alt",
    type: "No",
    title: "Dealls"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Physical DPS",
    brand: "Arms Warrior",
    collection: "Alt",
    type: "No",
    title: "Realls"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Healer",
    brand: "Holy Priest",
    collection: "Alt",
    type: "No",
    title: "Zealls"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Physical DPS",
    brand: "Combat Rogue",
    collection: "Alt",
    type: "No",
    title: "Stealls"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/869956899204894800/b9a7866b51c5485e1f3bde92ecceaf41.png?size=1024",
    category: "Tank",
    brand: "Feral Druid",
    collection: "Alt",
    type: "No",
    title: "Tankks"
  }),
  //Healls End
  //Shabbz Start
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Physical DPS",
    brand: "Combat Rogue",
    collection: "Main",
    type: "Yes",
    title: "Shabbz"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Tank",
    brand: "Prot Paladin",
    collection: "Alt",
    type: "Yes",
    title: "Bombshell"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Healer",
    brand: "Discpline Priest",
    collection: "Alt",
    type: "Yes",
    title: "Quickfix"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Caster DPS",
    brand: "Fire Mage",
    collection: "Alt",
    type: "No",
    title: "Blitztits"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Physical DPS",
    brand: "MM Hunter",
    collection: "Alt",
    type: "No",
    title: "Shabbzy"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Physical DPS",
    brand: "Arms Warrior",
    collection: "Alt",
    type: "No",
    title: "Saucysunders"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Physical DPS",
    brand: "Combat Rogue",
    collection: "Alt",
    type: "No",
    title: "Stealthygirl"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Physical DPS",
    brand: "Frost Death Knight",
    collection: "Alt",
    type: "No",
    title: "Katatonic"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/632491895636885504/7d6c276ad3894336c020b79abd0f0bd1.png?size=1024",
    category: "Tank",
    brand: "Blood Death Knight",
    collection: "Dualspec",
    type: "No",
    title: "Katatonic"
  }),
  //Shabbz End
  //Ironone 
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/650505478450839572/af426d810d092987fb4aff7b6bcb23c4.png?size=1024",
    category: "Caster DPS",
    brand: "Boomkin",
    collection: "Main",
    type: "yes",
    title: "Ironone"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/650505478450839572/af426d810d092987fb4aff7b6bcb23c4.png?size=1024",
    category: "Physical DPS",
    brand: "Ret Paladin",
    collection: "Alt",
    type: "No",
    title: "Ironfive"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/650505478450839572/af426d810d092987fb4aff7b6bcb23c4.png?size=1024",
    category: "Physical DPS",
    brand: "Combat Rogue",
    collection: "Alt",
    type: "no",
    title: "Irontwo"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/650505478450839572/af426d810d092987fb4aff7b6bcb23c4.png?size=1024",
    category: "Caster DPS",
    brand: "Arcane Mage",
    collection: "Alt",
    type: "no",
    title: "Ironzero"
  }),
  //Ironone end
  //Kirby Start
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/360287365417140225/0e4996374114b0defcd73f91338bf73d.png?size=1024",
    category: "Healer",
    brand: "Discpline Priest",
    collection: "Main",
    type: "no",
    title: "Kirbylyn"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/360287365417140225/0e4996374114b0defcd73f91338bf73d.png?size=1024",
    category: "Caster DPS",
    brand: "Fire Mage",
    collection: "Alt",
    type: "no",
    title: "Jesslyn"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/360287365417140225/0e4996374114b0defcd73f91338bf73d.png?size=1024",
    category: "Caster DPS",
    brand: "Boomkin",
    collection: "Pvp",
    type: "yes",
    title: "Maveyn"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/360287365417140225/0e4996374114b0defcd73f91338bf73d.png?size=1024",
    category: "Physical DPS",
    brand: "Subtlety Rogue",
    collection: "Pvp",
    type: "yes",
    title: "Weazly"
  }),
  //Kibry End
  //Yuichi start
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/141134260403699712/833313b0d4f2a7afbc19bab8db69f3e4.png?size=1024",
    category: "Physical DPS",
    brand: "Frost Death Knight",
    collection: "Alt",
    type: "no",
    title: "Methis"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/141134260403699712/833313b0d4f2a7afbc19bab8db69f3e4.png?size=1024",
    category: "Physical DPS",
    brand: "Frost Death Knight",
    collection: "Alt",
    type: "no",
    title: "Riddle"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/141134260403699712/833313b0d4f2a7afbc19bab8db69f3e4.png?size=1024",
    category: "Caster DPS",
    brand: "Frost Mage",
    collection: "Alt",
    type: "no",
    title: "Yuichi"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/141134260403699712/833313b0d4f2a7afbc19bab8db69f3e4.png?size=1024",
    category: "Caster DPS",
    brand: "Boomkin",
    collection: "Main",
    type: "yes",
    title: "Wkwkwkwk"
  }),
  //yuichi end
  //thres start
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/127129947872559104/6d287f19a150bcc5f8d753c188898fe9.png?size=1024",
    category: "Caster DPS",
    brand: "Destruction Warlock",
    collection: "Alt",
    type: "no",
    title: "Thres"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/127129947872559104/6d287f19a150bcc5f8d753c188898fe9.png?size=1024",
    category: "Physical DPS",
    brand: "Combat Rogue",
    collection: "Pvp",
    type: "yes",
    title: "Thressia"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/127129947872559104/6d287f19a150bcc5f8d753c188898fe9.png?size=1024",
    category: "Healer",
    brand: "Discpline Priest",
    collection: "Main",
    type: "yes",
    title: "Rosemoon"
  }),
  new VM_SearchResult({
    image: "https://cdn.discordapp.com/avatars/127129947872559104/6d287f19a150bcc5f8d753c188898fe9.png?size=1024",
    category: "Physical DPS",
    brand: "Ret Paladin",
    collection: "Pvp",
    type: "yes",
    title: "Flora"
  })
    //thres end
];




function randomizeImage(collection, field) {
  var category = ["animals", "architecture", "tech", "people", "nature", "any"];
  var number = ["grayscale", "sepia", "color"];

  for (var i = 0, c = collection.length; i < c; i++) {
    var value =
      collection[i][field] + _.sample(category) + "/" + _.sample(number);
    value += "?" + new Date().getTime();
    collection[i][field] = value;
  }
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

randomizeImage(window.data.categories, "image");
randomizeImage(window.data.products, "image");
window.app = new VM();
window.app.setFilterData(
  "categories",
  window.data.categories.map(function (obj) {
    return obj.caption;
  })
);
//app.selectedFilters.category('FRIGORIFERI');
window.app.fetchResults();
ko.applyBindings(app, document.getElementById("appfilters"));