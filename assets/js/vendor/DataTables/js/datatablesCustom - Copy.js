$(window).load(function(event) {
	var searchTerm = "";
	var searchbox;
	$("body").on("activateAfterInitProcedure", function(event, tableIdRaw, multiselect) {
		// alert("hit after init functions");
		var dataTableLengthHtml, parentDataTableLengthHtml, dataTableInfoHtml, parentDataTableInfoHtml;
		var dataTableLength, tableId;
		var dataTableInfo, dataTableWrapper;
		var parentOfDataTable;
		var searchTerm;
		var selectAllSelectedFlag = false;
		// setting up the ids
		dataTableWrapper = "#" + tableIdRaw + "_wrapper";

		tableId = "#" + tableIdRaw;
		dataTableLength = "#" + tableIdRaw + "_" + "length";
		dataTableInfo = "#" + tableIdRaw + "_" + "info";

		this.selectedArray = [1,2,3];

		console.log("selectedArray: "+this.selectedArray);

		console.log("dataTablewrapper: " + dataTableWrapper);
		console.log("tableId: " + tableId);
		console.log("dataTableLength: " + dataTableLength);
		console.log("dataTableInfo: " + dataTableInfo);

		jQuery.fn.oHTML = function(s) {
			return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
		};

		// parents
		function returnArray(){
			return this.selectedArray;
		}
		parentDataTableLengthHtml = $(dataTableLength).parent().addClass("dataTableInfoMod");
		parentDataTableInfoHtml = $(dataTableInfo).parent().addClass("dataTableLengthMod");
		parentOfDataTable = $(tableId).parent();

		dataTableLengthHtml = $(dataTableLength).find("select")[0].outerHTML;
		// dataTableLengthHtml = $(dataTableLength)[0].outerHTML;
		dataTableInfoHtml = $(dataTableInfo).html();

		$(parentDataTableLengthHtml).empty();
		$(parentDataTableInfoHtml).empty();

		console.log(dataTableLengthHtml);

		if (multiselect) {
			$(dataTableWrapper).find(".dataTableInfoMod").append("<div class='checkbox'><label><input class='selectAll' type='checkbox'>select all</label></div>");
		}

		$(dataTableWrapper).find(".dataTableLengthMod").append("<span style='margin-right:5px;'>page size:</span>");
		// $(dataTableWrapper).find(".dataTableLengthMod").append('<div class="dataTables_length" id="tableCrud_length">'+dataTableLengthHtml+'</div>');

		$(dataTableWrapper).find(".dataTableLengthMod").append(dataTableLengthHtml);

		// $(dataTableWrapper).find(".dataTableLengthMod").append('<select class="form-control input-sm" aria-controls="tableCrud" name="tableCrud_length"><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select>');

		$(dataTableWrapper).find(".dataTableLengthMod").append('<button class="btn btn-default datatable-glys-btn btn-refresh"><i class="ion-ios7-refresh-empty datatable-glys"></i></button>');

		$(dataTableWrapper).find(".dataTableLengthMod select").on("change", function(event) {
			console.log($(this).val());
			$(tableId).DataTable().page.len($(this).val()).draw();
		});

		$(dataTableWrapper).find('button.btn-refresh').click(function(event) {
			$(tableId).DataTable().draw();
		});
		/**
		 * initialising select dropdown for page size.
		 */
		$(dataTableWrapper).find(".dataTableLengthMod select").selecter({
			callback: function() {
				$(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
			}
		});
		/**
		 * initialising checkbox for select all
		 */
		$(dataTableWrapper).find(".selectAll").iCheck({
			handle: 'checkbox',
			checkboxClass: 'icheckbox_flat',
			checkedClass: 'checked',
			cursor: true,
		});

		/*select all checkbox when checked*/
		$(dataTableWrapper).find(".selectAll").on('ifChecked', function(event) {
			selectAllSelectedFlag = true;

			$(tableId).find('tr').each(function() {
				var id = $(this).find("td").eq(0).text();
				var index = $.inArray(id, selectedUserIds);
				singleSelectionFlag = false;
				if (index === -1 && id != '') {
					if (selectedUserIds.length != 100) {
						selectedUserIds.push(id);
						console.log("Ids selectedUserIds: " + selectedUserIds);
						$(this).addClass('success');
					} else {
						alert("Max 100 entries allowed!");
					}
				} else {
					// selectedUserIds.splice(index, 1);
					// $(this).removeClass('success');
				}
			});
		});
		/*select all checkbox when unchecked*/
		$(dataTableWrapper).find(".selectAll").on('ifUnchecked', function(event) {
			
			if(selectAllSelectedFlag){
				$(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");	
			}
			console.error("unchecking select");
		});

		$(dataTableWrapper).find("table.dataTable tbody tr").on("click", function(event) {
			var id = $(this).find("td").eq(0).text();
			var countRows = $(tableId + " tbody tr").length;
			var selectedRows = $(tableId + " tbody tr.success").length;
			console.log("rows are " + countRows + "\nSelected rows are: " + selectedRows);
			if (countRows == selectedRows) {
				console.log("all are selected");
				$(".selectAll").iCheck('check');
			} else {
				$(".selectAll").iCheck('uncheck');
				console.log("none or some are selected");
			}
			
			if ($(this).hasClass("success")) {
				console.log("onclick unselected id"+id);
				$(dataTableWrapper).find(".selectAll").trigger("clearSelectedTr",[id]);
				$(this).removeClass('success');
			} else {
				if(selectedUserIds.length!=100){
				  selectedUserIds.push(id);
				  console.log("Ids selectedUserIds: " + selectedUserIds);
				  $(this).addClass('success');
				} else{
				  alert("Max 100 entries allowed!");
				}
			}
		});
		/**
		 * search functionality for data tables
		 * @param  {[type]} event) {			searchbox [description]
		 * @return {[type]}        [description]
		 */
		$(tableId).on("init.dt", function(event) {

			searchbox = $('.dataTable').parent().find("input[type='search']");

			searchbox.unbind();

			parentOfDataTable.find(".dataTables_filter label").append("<i class='searchBtnIcon glyphicon glyphicon-search'></i>");
			searchbox.on("keyup", function(event) {
				var code = event.keyCode || event.which;
				if (code == 13) {
					// move to parent and then find search field n get value of it.
					searchTerm = parentOfDataTable.find('.dataTables_filter input').val();
					console.log("hit click: " + searchTerm);
					$(tableId).DataTable().search(searchTerm).draw();
					$(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
				}
			});


			$(tableId).on('draw.dt', function() {
				var countRows = $(tableId + " tbody tr").length;
				var selectedRows = $(tableId + " tbody tr.success").length;
				console.log("rows are " + countRows + "\nSelected rows are: " + selectedRows);
				if (countRows == selectedRows) {
					console.log("all are selected");
					$(".selectAll").iCheck('check');
				} else {
					$(".selectAll").iCheck('uncheck');
					console.log("none or some are selected");
				}
			});
		});


		$(dataTableWrapper).find(".selectAll").on("clearSelectAll", function(event) {
			console.log("clearing select all");
			selectAllSelectedFlag = false;
			$(dataTableWrapper).find(".selectAll").iCheck('uncheck');
			$(tableId).find('tr').each(function() {
				var id = $(this).find("td").eq(0).text();

				var index = $.inArray(id, selectedUserIds);
				console.log("index: "+index);
				if (index != 0 && id != '') {
					console.log("unchecking ids: "+ id);
					selectedUserIds.splice(index, 1);
					$(this).removeClass('success');
				}
			});
		});

		$(dataTableWrapper).find(".selectAll").on("clearSelectedTr", function (event, unSelectedId){
			console.log("in trigger onclick unselected id: "+unSelectedId);
			selectAllSelectedFlag = false;
			var index = $.inArray(unSelectedId, selectedUserIds);
			console.log("index of unselected id is "+index);
			if (index != 0 && unSelectedId != '') {
				$(dataTableWrapper).find(".selectAll").iCheck('uncheck');
				console.log("unchecking ids: "+ unSelectedId);
				selectedUserIds.splice(index, 1);
			}
		});

		$(dataTableWrapper).find("button.btn-refresh").on("click", function(event) {
			$(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
		});
	});

	// glyphicon.bind('click', function (e) {
	//   searchTerm=$('#tableCrud_filter input').val();
	//   crudTable.search(searchTerm).draw();
	// });



});
