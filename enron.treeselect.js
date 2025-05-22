(function ($) {
    function setChildrenChecked($checkbox, checked) {
        $checkbox.closest('li').find('input[type="checkbox"]').prop('checked', checked);
    }

    function updateParentState($checkbox) {
        const $parentLi = $checkbox.closest('ul').closest('li');
        if ($parentLi.length === 0) return;

        const $parentCheckbox = $parentLi.find('> label > input[type="checkbox"]');
        const $childCheckboxes = $parentLi.find('> ul input[type="checkbox"]');
        const checkedChildren = $childCheckboxes.filter(':checked');

        $parentCheckbox.removeClass("half-check").toggleClass("half-check", checkedChildren.length > 0 && checkedChildren.length < $childCheckboxes.length);

        const allChecked = $childCheckboxes.length && checkedChildren.length === $childCheckboxes.length;
        $parentCheckbox.prop('checked', allChecked);

        updateParentState($parentCheckbox);
    }

    function updateHiddenAndDisplay($tree, hiddenInput, $selectionDisplay, placeholder) {
        const selectedIds = [];
        const selectedNames = [];

        $tree.find('input[type="checkbox"]:checked').each(function () {
            selectedIds.push($(this).data('id'));
            selectedNames.push($(this).data('title'));
        });

        hiddenInput.val(selectedIds.join(','));
        $selectionDisplay.find('.selected-names').text(selectedNames.length ? selectedNames.join(', ') : placeholder);
    }

    function initializeCheckedParents($tree) {
        $tree.find('li').each(function () {
            const $checkbox = $(this).find('> label > input[type="checkbox"]');
            const $childCheckboxes = $(this).find('> ul input[type="checkbox"]');
            const checkedChildren = $childCheckboxes.filter(':checked');

            if ($childCheckboxes.length) {
                $checkbox.removeClass("half-check").toggleClass("half-check", checkedChildren.length > 0 && checkedChildren.length < $childCheckboxes.length);
                $checkbox.prop('checked', checkedChildren.length === $childCheckboxes.length);
            }
        });
    }

    function toggleArrow($arrow, expand) {
        const $ul = $arrow.siblings('ul');
        if ($ul.length) {
            $ul.slideToggle(150);
            $arrow.toggleClass('expanded', expand);
        }
    }

    $.fn.enronTree = function (options) {
        const settings = $.extend({
            data: [],
            inputName: 'selected_ids',
            preselected: '',
            placeholder: 'Select options...',
            arrowHtml: '▶',
            subArrowHtml: '▶'
        }, options);

        return this.each(function () {
            const $container = $(this).addClass('enron-tree-container');
            const preselectedIds = settings.preselected
                .split(',')
                .map(id => parseInt(id.trim(), 10))
                .filter(id => !isNaN(id));

            const hiddenInput = $('<input>', {
                type: 'hidden',
                name: settings.inputName
            });

            const $selectionDisplay = $(`
                <div class="enron-tree-selection">
                    <span class="selected-names">${settings.placeholder}</span>
                    <span class="arrow toggle-root">${settings.arrowHtml}</span>
                </div>
            `);

            $container.append($selectionDisplay);
            $container.append(hiddenInput);

            function renderTree(data) {
                const $ul = $('<ul class="enron-tree" style="display:none;"></ul>');
                data.forEach(item => {
                    const $li = $('<li></li>');
                    const $checkbox = $('<input>', {
                        type: 'checkbox',
                        'data-id': item.id,
                        'data-title': item.title.trim()
                    });

                    if (preselectedIds.includes(item.id)) {
                        $checkbox.prop('checked', true);
                    }

                    const $label = $('<label></label>');
                    $label.append($checkbox).append(' ' + item.title.trim());
                    $li.append($label);

                    if (item.subs && item.subs.length > 0) {
                        const $arrow = $(`<span class="arrow node-arrow">${settings.subArrowHtml}</span>`);
                        $li.append($arrow);
                        const $childUl = renderTree(item.subs);
                        $li.append($childUl);
                    }

                    $ul.append($li);
                });
                return $ul;
            }

            const $tree = renderTree(settings.data);
            $container.append($tree);

            $tree.on('change', 'input[type="checkbox"]', function () {
                const $checkbox = $(this);
                const checked = $checkbox.is(':checked');
                setChildrenChecked($checkbox, checked);
                updateParentState($checkbox);
                updateHiddenAndDisplay($tree, hiddenInput, $selectionDisplay, settings.placeholder);
            });

            $container.on('click', '.toggle-root', function () {
                $tree.slideToggle(150);
                $(this).toggleClass('expanded');
            });

            $tree.on('click', '.node-arrow', function (e) {
                e.stopPropagation();
                toggleArrow($(this));
            });

            initializeCheckedParents($tree);
            updateHiddenAndDisplay($tree, hiddenInput, $selectionDisplay, settings.placeholder);
        });
    };
}(jQuery));
