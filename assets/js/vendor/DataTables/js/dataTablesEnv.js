(function($) {
  var DatatableEnv = function(selector, options) {
    this.table = selector;
    this.$table = $(selector);
    this.options = jQuery.extend({}, this.defaults, options);


    this.datatableObj = undefined;
    this.tableCompleteInit = false;
    // console.log(this.options);
    this.selectedFlag = false, this.rowId = "";
    this.tableIdRaw = this.$table.attr("id");
    this.selectedUserIds = [];
    this.selectAllSelectedFlag = false;
    this.multiselectOption = this.options.datableInitComplete.multiselect;
    // console.log(this.multiselectOption);
    this.$datatable = undefined;
    this.getJsonData = [];
    this.delay = (function() {
      var timer = 0;
      return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
      };
    })();
  };
  DatatableEnv.prototype = {
    constructor: DatatableEnv,
    defaults: {
      datatableConfig: "",
      addRemoveUser: false,
    },
    init: function(url) {
      url === undefined ? '' : url;

      if (this.tableCompleteInit === false) {
        this._init(url);
        // console.log("initializig first time");
      } else {
        // console.log("in class "+url);
        if (this.options.datatableConfig.ajax.url != url) {
          this.options.datatableConfig.ajax.url = url;
          // console.log(this.options.datatableConfig.ajax);
          this.$table.DataTable().destroy(false);
          this.$table.dataTable(this.options.datatableConfig);
        } else {
          this.$table.DataTable().draw();
        }
        // console.log("initializig other times");
      }

      console.info("this.selectedUserIds: "+this.selectedUserIds);
    },
    _init: function(url) {
      var that = this;
      // alert("hello this is datatable class and i am refering to: "+$(this.selector).attr("id"));
      $.fn.dataTable.defaults.ajax = {
        error: function(xhr, status, error) {
          if (xhr.status == "404") {
            // alert("issue in backend data source!!!");
            bootbox.alert("An error occured while processing request. Please try again later!", function() {});
            xhr.abort();
          } else if (xhr.status == "500") {
            bootbox.alert("An error occured while processing request. Please try again later!", function() {});
            xhr.abort();
          }/* else {
            bootbox.alert("unknow hit!", function() {});
            xhr.abort();
          }*/
          $(".spinner-backdrop").hide();
        }
      };
      this.options.datatableConfig.ajax.url = url;
      this.$datatable = this.$table.on('preXhr.dt', function(e, settings, data) {
        // console.log("called on predraw");
        data.order[0].columnKey = data.columns[data.order[0].column].data;
        // console.log(data);
      }).dataTable(this.options.datatableConfig);

      this.$table.on('init.dt', function() {
        that.initDatable();
      });
      this.$table.on('draw.dt', function() {
        that.drawDataTable();
        that.selectionUiFunc(this);
        that.clickRowFunc(this);
        that.checkSelectBox();
      });
    },
    search: function(searchTerm, callback) {
      this.$table.DataTable().search(searchTerm).draw();
      this.$table.parent().find("input[type='search']").val(searchTerm);
      if (callback !== undefined) {
        callback();
      }
    },
    testAlert: function() {
      // console.log(this.tableId);
    },
    initDatable: function() {
      var table = this.table;
      // console.log("table id is : "+$(table).attr("id"));
      this.modifyTable();
      // this.datatableObj = new activateAfterInitProcedure($(table).attr("id").toString(), this.options.datableInitComplete.multiselect, []);
      this.backdropState("hide");
      this.tableCompleteInit = true;
    },
    dblclickSelect: function(callback) {
      /*this.$table.on('dblclick', 'tr', function() {
        main.rowId = $(this).find('td').eq(0).text();
        main.selectedFlag = true;
        callback();
      });*/
    },
    clickRowFunc: function(drawnTable) {
      var $table = this.$table,
        main = this,
        id, countRows, selectedRows, text;
      $(drawnTable).find("tbody tr").on("click", function(event) {
        id = $(this).find("td").eq(0).text();
        text = $(this).find("td").eq(2).text();
        countRows = $table.find(" tbody tr").length;
        selectedRows = $table.find(" tbody tr.success").length;
        // console.log("rows are " + countRows + "\nSelected rows are: " + selectedRows);

        if (countRows == selectedRows) {
          // console.log("all are selected");
          $(".selectAll").iCheck('check');
        } else {
          $(".selectAll").iCheck('uncheck');
          // console.log("none or some are selected");
        }
        // console.log("multiselection is "+main.multiselectOption);

        if (main.multiselectOption) {
          if ($(this).hasClass("success")) {
            // console.log("onclick unselected id"+id);
            main.clearSelectedId(id);
            main.selectedFlag = false;
            $(this).removeClass('success');
            // console.log("removed "+id+" from list " + main.selectedUserIds);
          } else {
            if (main.selectedUserIds.length != 100) {
              main.selectedUserIds.push(id);
              main.getJsonData.push({
                "id": id,
                "text": text
              });
              // console.log("Ids in main.selectedUserIds: " + main.selectedUserIds);
              $(this).addClass('success');
            } else {
              bootbox.alert("Maximum 100 entries allowed!", function() {});
            }
          }
          // console.log(main.getJsonData);
          main.checkSelectBox();
        } else {
          // console.log("tableId: " + $(this).parent().parent().attr("id"));
          if ($(this).hasClass('success')) {
            $(this).removeClass('success');
            main.selectedFlag = false;
            main.rowId = '';
            // console.log("----------deselecting the row");
          } else {
            $(this).find("td i.remove").addClass("active");
            $(this).find("td i.add").addClass("active");
            $table.find('tr.success').removeClass('success');
            $(this).addClass('success');
            main.rowId = $(this).find('td').eq(0).text();
            main.selectedFlag = true;
            console.log("Selecting the row: "+main.rowId);
          }
        }
        if (main.options.onRowSelect != undefined) {
          main.options.onRowSelect();
        }

      });
    },
    checkSelectBox: function() {
      var tableId = this.table,
        dataTableWrapper = this.$table.parent(),
        main = this,
        totalTrs, outIndex;
      this.selectAllSelectedFlag = false;
      totalTrs = this.$table.find("tbody tr").length;
      // console.log("total no of trs are "+totalTrs);
      this.$table.find("tbody tr").each(function(index, el) {
        outIndex = index;
        if (!$(this).hasClass('success')) {
          outIndex = 0;
          return false;
        }
      });

      // console.log("outIndex: "+outIndex);

      if (outIndex > 0) {
        $(dataTableWrapper).find(".selectAll").iCheck('check');
      } else {
        $(dataTableWrapper).find(".selectAll").iCheck('uncheck');
      }
    },
    clearSelectedId: function(unSelectedId) {
      var main = this;
      this.selectAllSelectedFlag = false,
        dataTableWrapper = $(this.table).parent();
      var index = $.inArray(unSelectedId, main.selectedUserIds);
      if (index > -1 && unSelectedId != '') {
        $(dataTableWrapper).find(".selectAll").iCheck('uncheck');
        main.selectedUserIds.splice(index, 1);
        main.getJsonData.splice(index, 1);
        main.$table.find("tbody tr td:first-child").each(function(index, el) {
          if ($(el).text() == unSelectedId) {
            // console.log("found unselected id at " + index + " index");
            $(el).parent().removeClass('success');
          }
        });
      }
      // console.log("main.selectedUserIds: " + main.selectedUserIds);
    },
    triggerClearAllFunc: function() {
      var tableId = this.table,
        dataTableWrapper = this.$table.parent(),
        main = this;
      this.selectAllSelectedFlag = false;
      $(dataTableWrapper).find(".selectAll").iCheck('uncheck');
      $(tableId).find('tr').each(function() {
        var id = $(this).find("td").eq(0).text();
        var index = $.inArray(id, main.selectedUserIds);
        if (index > -1 && id != '') {
          main.selectedUserIds.splice(index, 1);
          main.getJsonData.splice(index, 1);
          $(this).removeClass('success');
        }
      });

      if (this.multiselectOption === false) {
        $(tableId).find("tr.success").removeClass('success');
        this.rowId = "";
        this.selectedFlag = false;
      }
      // console.log("in trigger clear all: " + main.selectedUserIds);
      if (main.options.onRowSelect != undefined) {
        main.options.onRowSelect();
      }
    },
    selectionUiFunc: function(that) {
      // console.log("coming in search function");
      var main = this;
      var countRows = this.$table.find("tbody tr").length;
      var selectedRows = this.$table.find("tbody tr.success").length, text, id;

      if (this.multiselectOption) {
        if (countRows == selectedRows) {
          this.$table.find(".selectAll").iCheck('check');
        } else {
          this.$table.find(".selectAll").iCheck('uncheck');
        }
        $(that).find("tbody tr").each(function() {
          if ($.inArray($(this).find('td').eq(0).text(), main.selectedUserIds) !== -1) {
            $(this).addClass('success');
            text = $(this).find("td").eq(2).text();
            id = $(this).find('td').eq(0).text();
            console.log(main.getJsonData);
            console.log(main.selectedUserIds);
          }
        });
        // console.log("multiselect enabled");
      } else {
        $(that).find("tbody tr").each(function() {
          // console.log("selected id is "+main.rowId);
          if ($(this).find('td').eq(0).text() == main.rowId) {
            $(this).addClass('success');
            // console.log("" + $(this).find('td').eq(0).text());
            return false;
          }
        });
        // console.log("multiselect disabled");
      }
    },
    modifyTable: function() {
      var dataTableLengthHtml, parentDataTableLengthHtml,
        dataTableInfoHtml, parentDataTableInfoHtml,
        dataTableFilter, dataTableFilterInput;
      var dataTableLength, tableId;
      var dataTableInfo, dataTableWrapper;
      var parentOfDataTable;
      var searchTerm;
      this.selectAllSelectedFlag = false;

      dataTableWrapper = "#" + this.tableIdRaw + "_wrapper";
      var main = this;

      // console.log("+++list:" + this.selectedUserIds.length);
      tableId = "#" + this.tableIdRaw;
      this.tableId = tableId;

      dataTableLength = "#" + this.tableIdRaw + "_" + "length";
      dataTableInfo = "#" + this.tableIdRaw + "_" + "info";
      dataTableFilter = "#" + this.tableIdRaw + "_" + "filter";
      dataTableFilterInput = $(dataTableFilter).find("input[type='search']")[0].outerHTML;
      dataTableFilterInput = "<label><span class='custLabel'>Search:</span>" + dataTableFilterInput + "</label>";
      // console.log("in modifyTable: "+dataTableWrapper);

      $(dataTableFilter).html(dataTableFilterInput);

      parentDataTableLengthHtml = $(dataTableLength).parent().addClass("dataTableInfoMod");
      parentDataTableInfoHtml = $(dataTableInfo).parent().addClass("dataTableLengthMod");
      parentOfDataTable = $(tableId).parent();

      dataTableLengthHtml = $(dataTableLength).find("select")[0].outerHTML;
      // dataTableLengthHtml = $(dataTableLength)[0].outerHTML;
      dataTableInfoHtml = $(dataTableInfo).html();

      $(parentDataTableLengthHtml).empty();
      $(parentDataTableInfoHtml).empty();

      $(dataTableWrapper).find(".dataTableLengthMod").append("<span style='margin-right:5px;'>page size:</span>");
      $(dataTableWrapper).find(".dataTableLengthMod").append(dataTableLengthHtml);
      $(dataTableWrapper).find(".dataTableLengthMod").append('<button class="btn btn-default datatable-glys-btn btn-refresh"><i class="ion-ios7-refresh-empty datatable-glys"></i></button>');

      $(dataTableWrapper).find(".dataTableLengthMod select").on("change", function(event) {
        console.log($(this).val());
        $(tableId).DataTable().page.len($(this).val()).draw();
      });
      $(dataTableWrapper).find('button.btn-refresh').click(function(event) {
        $(tableId).DataTable().draw();
        main.triggerClearAllFunc();
      });

      $(dataTableWrapper).find(".dataTableLengthMod select").selecter({
        callback: function() {
          $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
        }
      });
      if (this.options.datableInitComplete.multiselect) {
        this.multiselectUifun(dataTableWrapper, tableId);
      }
      this.searchUiFunc(dataTableWrapper, parentOfDataTable, tableId);
    },
    searchUiFunc: function(dataTableWrapper, parentOfDataTable, tableId) {
      searchbox = $(tableId).parent().find("input[type='search']");
      var that = this;
      var returnHit = false;
      var thatSearchInput, searchTerm;
      searchbox.unbind();

      parentOfDataTable.find(".dataTables_filter label").append("<i class='searchBtnIcon glyphicon glyphicon-search'></i>");
      searchbox.on('focus', function (event){
        returnHit = false;
      });
      searchbox.on("keyup", function(event) {
        thatSearchInput = this;
        var code = event.keyCode || event.which;
        if (code == 13) {
          searchTerm = $.trim($(this).val());
          if (searchTerm != "") {
            // move to parent and then find search field n get value of it.
            // console.log("hit keyup: enter key" + searchTerm);
            console.log($(tableId).attr("id"));
            $(tableId).DataTable().search(searchTerm).draw();
            $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
            returnHit = true;
          }
        } else {
          that.delay(function() {
            if(!returnHit){
              searchTerm = $.trim($(thatSearchInput).val());
              // console.log("hit keyup delay: " + searchTerm);
              // console.log($(tableId).attr("id"));
              $(tableId).DataTable().search(searchTerm).draw();
              $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
            }
            returnHit = false;
          }, 2000);
        }

      });

      parentOfDataTable.find("i.searchBtnIcon").on("click", function(event) {
        searchTerm = $.trim(parentOfDataTable.find('.dataTables_filter input').val());
        if (searchTerm != "") {
          // console.log("hit click search button: " + searchTerm);
          $(tableId).DataTable().search(searchTerm).draw();
          $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
        }
      });
    },
    getColValue: function(col) {
      var saveIndex = "3";
      // var index = this.$table.find("thead tr th").data(col).index();
      $("#tableCrud").find("thead tr th").each(function(index, el) {
        if($(el).data("name") === col){
          console.log("index is "+index);
          saveIndex = index;
          return false;
        }
      });
      // console.log("inside: "+this.$table.find("tr.success td").eq(saveIndex).text());
      return this.$table.find("tr.success td").eq(saveIndex).text();
    },
    multiselectUifun: function(dataTableWrapper, tableId) {
      var main = this;
      $(dataTableWrapper).find(".dataTableInfoMod").append("<div class='checkbox'><label><input class='selectAll' type='checkbox'>select all</label></div>");
      $(dataTableWrapper).find(".selectAll").iCheck({
        handle: 'checkbox',
        checkboxClass: 'icheckbox_flat',
        checkedClass: 'checked',
        cursor: true,
      });
      /*select all checkbox when checked*/
      $(dataTableWrapper).find(".selectAll").on('ifChecked', function(event) {
        main.selectAllSelectedFlag = true;

        $(tableId).find('tr').each(function() {
          var id = $(this).find("td").eq(0).text();
          var text = $(this).find("td").eq(2).text();
          var index = $.inArray(id, main.selectedUserIds);
          main.singleSelectionFlag = false;
          if (index === -1 && id != '') {
            if (main.selectedUserIds.length != 100) {
              main.selectedUserIds.push(id);
              main.getJsonData.push({
                "id": id,
                "text": text
              });
              // console.log("Ids main.selectedUserIds: " + main.selectedUserIds);
              $(this).addClass('success');
            } else {
              alert("Max 100 entries allowed!");
            }
          } else {
            // this.selectedUserIds.splice(index, 1);
            // $(this).removeClass('success');
          }
        });
        // console.log("selected userids: " + main.selectedUserIds);
        // console.log(main.getJsonData);
        if (main.options.onRowSelect != undefined) {
          main.options.onRowSelect();
        }
      });
      /*select all checkbox when unchecked*/
      $(dataTableWrapper).find(".selectAll").on('ifUnchecked', function(event) {
        main.selectAllSelectedFlag = true;
        main.$table.find("tbody tr").each(function(index, el) {
          outIndex = index;
          console.log("index: "+index+"marked");
          if (!$(this).hasClass('success')) {
            main.selectAllSelectedFlag = false;
            return ;
          }
        });
        if (main.selectAllSelectedFlag) {
          main.triggerClearAllFunc();
          console.log("inside if conditional");
        }
        console.log("user after checking select are: "+main.selectedUserIds);
        console.info("unchecking select");
      });
    },
    onClickAddIcon: function (callback) {
      this.$table.find("tbody tr td i.add").on("click", function() {
        callback($(this));
      });
    },
    onClickRemoveIcon: function (callback) {
      this.$table.find("tbody tr td i.remove").on("click", function() {
        callback($(this));
      });
    },
    drawDataTable: function(callback) {
      var addRemoveUser = this.options.addRemoveUser;
      var id;
      var dataTableWrapper = this.$table.parent();
      // alert("this.tableCompleteInit: "+this.tableCompleteInit);
      if (addRemoveUser) {
        this.$table.find(" tbody tr td:nth-child(2)").append('<i class="add icon-addUser" data-placement="left" title="click to add users"></i>');
        this.$table.find("tbody tr td:nth-child(2)").append('<i class="remove icon-removeUser" data-placement="right" title="click to remove users"></i>');

        this.$table.find('i.add, i.remove').tooltip({
          'delay': {
            "show": 500,
            "hide": 0
          }
        });
      }
      // console.log(typeof this.options.customDrawCallback);
      if (typeof this.options.customDrawCallback != 'undefined') {
        // console.log("not undefined");
        this.options.customDrawCallback(this.$table);
      } else {
        // console.log("contains null");
      }

      // $(dataTableWrapper).find(".dataTables_paginate span.first").addClass('disabled')
      //   .end()
      //   .find(".dataTables_paginate span.previous").addClass('disabled');
      var paginateInputVal = $(dataTableWrapper).find("input.paginate_input").val();

      // find how many pages are there in datatable
      var paginateNo = $.trim($(dataTableWrapper).find(".dataTables_paginate span.paginate_of").text()).split(" ")[1];
      // console.log("of pages: "+paginateNo);
      if(paginateInputVal == paginateNo){
        $(dataTableWrapper)
          .find(".dataTables_paginate span.last").addClass('disabled')
          .end()
          .find(".dataTables_paginate span.next").addClass('disabled')
          .end()
          .find(".dataTables_paginate span.first").removeClass('disabled')
          .end()
          .find(".dataTables_paginate span.previous").removeClass('disabled');
      }  else if(paginateNo == 0){
        // console.log("now in paginate 0");
        $(dataTableWrapper)
          .find(".dataTables_paginate span.last").addClass('disabled')
          .end()
          .find(".dataTables_paginate span.next").addClass('disabled')
          .end()
          .find(".dataTables_paginate span.first").addClass('disabled')
          .end()
          .find(".dataTables_paginate span.previous").addClass('disabled');
      } else if (paginateInputVal == 1) {
        // console.log("now in paginate 1");
        $(dataTableWrapper)
          .find(".dataTables_paginate span.previous").addClass('disabled')
          .end()
          .find(".dataTables_paginate span.first").addClass('disabled')
          .end()
          .find(".dataTables_paginate span.last").removeClass('disabled')
          .end()
          .find(".dataTables_paginate span.next").removeClass('disabled');
      } else {
        $(dataTableWrapper)
          .find(".dataTables_paginate span.last").removeClass('disabled')
          .end()
          .find(".dataTables_paginate span.next").removeClass('disabled')
          .end()
          .find(".dataTables_paginate span.first").removeClass('disabled')
          .end()
          .find(".dataTables_paginate span.previous").removeClass('disabled');
      }
      // console.log("paginateNo: " + paginateNo);
    },
    backdropState: function(state) {
      if (state == "show") {
        $(".spinner-backdrop").fadeIn('fast');
      } else {
        $(".spinner-backdrop").fadeOut('fast');
      }
    },
    getSelectedUserIds: function() {
      if (this.multiselectOption === true) {
        // console.log("calling getSelectedIds:" + this.selectedUserIds);
        return this.selectedUserIds;
      } else {
        var rowIdVal = this.$table.find("tbody tr.success").find('td').eq(0).text();
        console.log("rowId selected is:" + rowIdVal);
        return {
          rowId: rowIdVal,
          selectedFlag: this.selectedFlag
        };
      }
    },
    setSelectedUserIds: function (userIdsArray) {
      var array = [];
      console.log("userIdsArray: "+userIdsArray);
      if(userIdsArray !== undefined && userIdsArray.length !== 0){
        array = userIdsArray.split(",");
      }

      // $.each(userIdsArray, function(index, val) {
      //   array.push(val.id);
      // });
      // console.log("13 Aug 2015:  array found from json is "+array);
      this.selectedUserIds = array;
      // console.log("13 Aug 2015: userIdsArray assigned to this.selectedUserIds: "+this.selectedUserIds);
    },
    getRowId: function () {
      if(this.multiselectOption){
        return this.selectedUserIds;
      } else {
        return this.$table.parent().parent().find('td').eq(0).text();
      }
    },
    resetSelectedUserIds: function() {
      this.selectedUserIds.length = 0;
      this.rowId = "";
      this.selectedFlag = false;
      this.getJsonData.length = 0;

      console.info("resetting " + this.$table.attr("id"));
    },
    refresh: function() {
      // console.log("drawing " + this.table);
      this.$table.DataTable().draw();
    },
    getNames: function() {
      // console.log(this.getJsonData);
      return this.getJsonData;
    },
    drawCallbackEvent: function (callback) {
      console.log("hello world");
      this.$table.on('draw.dt', function() {
        callback();
      });
    },
    onInitEvent: function (callback) {
      this.$table.on('init.dt', function () {
        callback(this);
      })
    },
    returnTableId: function () {
      // console.log(this.$table);
      return this.$table;
    }
  };

  $.fn.datatableEnv = function(options) {
    var datatable = new DatatableEnv(this, options);
    // datatable.showAlert();
    return {
      initialize: function(url) {
        datatable.init(url);
      },
      redraw: function() {
        datatable.drawDataTable();
      },
      testAlert: function() {
        datatable.showAlert();
        return this;
      },
      getSelectedUserIds: function() {
        // alert("hello world");
        return datatable.getSelectedUserIds();
      },
      resetSelectedUserIds: function() {
        datatable.resetSelectedUserIds();
        return this;
      },
      refresh: function() {
        datatable.refresh();
        return this;
      },
      search: function(data, callback) {
        datatable.search(data, callback);
      },
      getNames: function(col) {
        return datatable.getNames();
      },
      dblclickSelect: function(callback) {
        if (callback !== undefined) {
          datatable.dblclickSelect(callback);
        } else {
          console.error("datatablevn error: callback not defined for dblclickSelect");
        }
      },
      clearSelectedId: function(id) {
        datatable.clearSelectedId(id);
      },
      getColValue: function(no){
        return datatable.getColValue(no);
      },
      drawCallbackEvent: function (callback){
        datatable.drawCallbackEvent(callback);
      },
      onClickAddIcon: function (callback) {
        datatable.onClickAddIcon(callback);
      },
      onClickRemoveIcon: function (callback) {
        datatable.onClickRemoveIcon(callback);
      },
      getRowId: function () {
        return datatable.getRowId();
      },
      onInitEvent: function (callback) {
        datatable.onInitEvent(callback);
      },
      returnTableId: function () {
        return datatable.returnTableId();
      },
      setSelectedUserIds: function (userIdsArray) {
        datatable.setSelectedUserIds(userIdsArray);
      }
    };
  };
}(jQuery, window, document));
