var maxId;
var maxdepth;
var savedData;
var searchData;
var color = ['#3090C7', '#566D7E', '#C38EC7', '#46C7C7', '#8467D7', '#4AA02C', '#E56717', '#ECD872'];
var chart;
const dataUrl = 'https://familytreeapi.azurewebsites.net/';

function openNav() {
    document.getElementById('mySidenav').style.width = '30%';
    document.getElementById('main').style.marginRight = '30%';
}

function closeNav() {
    document.getElementById('mySidenav').style.width = '0';
    document.getElementById('main').style.marginRight = '0';
    document.getElementById('main').style.width = '100%';
    chart.render();
}



function resetChartState() {
    chart.clearHighlighting();
    const attrs = chart.getChartState();
    attrs.root.children.forEach((d) => d.expand);
    attrs.root.children.forEach((d) => {
        chart.collapse(d);
        chart.setExpansionFlagToChildren(d, false);
    });
    chart.render();
}

function expandAll() {
    chart.clearHighlighting();
    const attrs = chart.getChartState();
    attrs.root.children.forEach((d) => d.expand);
    attrs.root.children.forEach((d) => {
        chart.setExpansionFlagToChildren(d, true);
    });
    chart.render();
}

function getFilterDirectorJson() {
    chart.render();
    resetChartState();
    $('#filter_data_div').empty();

    var searchTerm = $('#name').val();
    var searchParentTerm = $('#parent').val();

    if (!searchTerm || searchTerm === '') {
        alert('ادخل الاسم لإتمام البحث...');
        chart.render();
        return;
    }

    if (!searchParentTerm || searchParentTerm === '') {
        alert('ادخل اسم الاب لإتمام البحث...');
        chart.render();
        return;
    }

    var filterdData = Object.values(searchData).filter((item) => item?.name?.indexOf(searchTerm) !== -1);
    filterdData = filterdData.filter((item) => item.parent?.name?.indexOf(searchParentTerm) !== -1);

    var div = $('<div class="mt-2rem d-grid search-result"/>');
    var title = '<span class="mt-2 search-title">نتائح البحث ...</span>';
    div.append(title);
    $.each(filterdData, function (x, value) {
        var div1 = $('<div class="mt-1 search-item"/>');
        var v = value.name;
        var parent = value.parent?.name;
        if (parent) v = v + ' بن ' + parent;
        var grand = value.parent?.parent?.name;

        if (grand) {
            v = v + ' بن ' + grand;
        }
        var button = $("<div class='mt-1 d-grid'><button class='btn btn-light'>" + v + '</button></div>');
        button.click(function () {
            markNode(value.id);
        });
        div1.append(button);
        div.append(div1);
    });

    $('#filter_data_div').append(div);
}

d3.json(dataUrl).then((dataFlattened) => {
    savedData = dataFlattened ;
    searchData = { ...dataFlattened };
    const ids = Object.values(dataFlattened).map((object) => {
        return object.id;
    });

    maxId = Math.max(...ids);
    chart = new d3.OrgChart()
        .container('.chart-container')
        .data(dataFlattened)
        .nodeWidth((d) => 250)
        .initialZoom(0.9)
        .nodeHeight((d) => 175)
        .childrenMargin((d) => 40)
        .compactMarginBetween((d) => 15)
        .compactMarginPair((d) => 80)
        .nodeContent(function (d, i, arr, state) {
            return `<div style="background-color:none;margin-left:1px;height:${d.height}px;border-radius:2px;overflow:visible">
                        <div style="height:${d.height}px;padding-top:0px;background-color:white;border:1px solid lightgray;">
                            <div style="background-color:${color[d.depth]};height:10px;width:${d.width - 2}px;border-radius:1px"></div>
                            <div style="padding:20px; padding-top:35px;text-align:center">
                                <div style="color:#111672;font-size:1.5vw;font-weight:bold"> ${d.data.name} </div>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding-left:15px;padding-right:15px;">
                                <div>  عدد الاولاد:  ${d.data._directSubordinates} <i class="fa fa-user" aria-hidden="true"></i></div>
                                <div> عدد الفروع: ${d.data._totalSubordinates} <i class="fa fa-user" aria-hidden="true"></i></div>
                            </div>
                            <div style="display:flex;justify-content:center">
                                <button class="btn btn-info m-1" style="background-color:${color[d.depth]}; color:#fff" onclick="openAddNodeModal(${d.id})">
                                    <i class="fa fa-plus-circle" aria-hidden="true"></i>
                                    اضافة
                                </button>
                            </div>
                        </div>
                    </div>`;
        })
        .render();
});

function openAddNodeModal(parentId) {
    $('#newNodeName').val('') 
    var myModal = new bootstrap.Modal(document.getElementById('addnodeModal'), {
        keyboard: false
    })
    myModal.show()
    maxId = 0;
    const ids = Object.values(savedData).map((object) => {
        return object.id;
    });
    maxId = Math.max(...ids);
    maxId++;

    $('#parentId').val(parentId);
}

function addNode(){
    var newNodeName = $('#newNodeName').val();
    var parentId = $('#parentId').val();


    if (!newNodeName || newNodeName === '') {
        alert('ادخل االاسم لاضافة العقدة!');
        return;
    }

    chart.addNode({ id: maxId, name: newNodeName, parentId: parseInt(parentId) });
    chart.render();
}

function markNode(id) {
    resetChartState();

    chart.setUpToTheRootHighlighted(id).render().fit();
}

function save() {
    $.ajax({
        type: 'POST',
        url: dataUrl,
        data: JSON.stringify({ people: Object.values(savedData) }),
        contentType: 'application/json; charset=utf-8',
        success: function (data) {
            console.log(data);
        },
        error: function (errMsg) {
            console.log(errMsg);
        },
    });
}

function expend() {
    chart.setExpanded(maxId).render();
}
