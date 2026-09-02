import { useEffect, useMemo, useRef, useState } from "react";
import {
    BsCheckCircleFill,
    BsChevronDown,
    BsChevronRight,
    BsGripVertical,
    BsSearch,
} from "react-icons/bs";
import {
    Button,
    CloseIcon,
    CustomCheckbox,
    GroupIcon,
    OrganizationIcon,
    SearchBar,
} from "@ucc/common-ui";
import useCreateOrgGrpStore, {
    emptyCreateOrgGrpHierarchy,
} from "@/store/useCreateOrgGrpStore";
import {
    PARENT_ORGANIZATIONS,
    ParentOrgNode,
    searchParentOrganizations,
} from "./data/parentOrganizations";
import {
    HierarchyEntityType,
    HierarchyPlacement,
} from "./types";
import "./HierarchyForm.scss";

type HierarchyCandidate = {
    id: string;
    name: string;
    type: HierarchyEntityType;
};

export const HierarchyForm: React.FC = () => {
    const orgRecords = useCreateOrgGrpStore((state) => state.basicInfo.orgRecords);
    const groupRecords = useCreateOrgGrpStore(
        (state) => state.basicInfo.groupRecords,
    );
    const parentQuery = useCreateOrgGrpStore(
        (state) => state.hierarchy.parentQuery,
    );
    const selectedParentId = useCreateOrgGrpStore(
        (state) => state.hierarchy.selectedParentId,
    );
    const placements = useCreateOrgGrpStore(
        (state) => state.hierarchy.placements,
    );
    const setHierarchy = useCreateOrgGrpStore((state) => state.setHierarchy);

    const [activeTab, setActiveTab] = useState<HierarchyEntityType>("org");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [draggingIds, setDraggingIds] = useState<string[]>([]);
    const [dragOverParentId, setDragOverParentId] = useState<string | null>(null);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const dragPreviewRef = useRef<HTMLDivElement>(null);
    const dragPreviewLabelRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!suggestionsOpen) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (!searchRef.current?.contains(event.target as Node)) {
                setSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [suggestionsOpen]);

    const orgs = useMemo<HierarchyCandidate[]>(
        () =>
            orgRecords.map((record) => ({
                id: record.id,
                name: record.name,
                type: "org",
            })),
        [orgRecords],
    );
    const groups = useMemo<HierarchyCandidate[]>(
        () =>
            groupRecords.map((record) => ({
                id: record.id,
                name: record.name,
                type: "group",
            })),
        [groupRecords],
    );
    const allCandidates = useMemo(() => [...orgs, ...groups], [orgs, groups]);
    const visibleCandidates = activeTab === "org" ? orgs : groups;

    const suggestions = useMemo(
        () => searchParentOrganizations(parentQuery),
        [parentQuery],
    );
    const selectedParent = useMemo(
        () =>
            PARENT_ORGANIZATIONS.find((parent) => parent.id === selectedParentId) ??
            null,
        [selectedParentId],
    );

    const placementByEntity = useMemo(
        () =>
            new Map(
                placements.map((placement) => [
                    placement.entityId,
                    placement,
                ]),
            ),
        [placements],
    );

    const placedOrgCount = orgs.filter((org) =>
        placementByEntity.has(org.id),
    ).length;
    const placedGroupCount = groups.filter((group) =>
        placementByEntity.has(group.id),
    ).length;
    // Placed rows lose their checkbox, so selection only spans what is left.
    const selectableCandidates = visibleCandidates.filter(
        (candidate) => !placementByEntity.has(candidate.id),
    );
    const allVisibleSelected =
        selectableCandidates.length > 0 &&
        selectableCandidates.every((candidate) =>
            selectedIds.includes(candidate.id),
        );

    const setTab = (tab: HierarchyEntityType) => {
        setActiveTab(tab);
        setSelectedIds([]);
    };

    const toggleCandidate = (id: string, checked: boolean) => {
        setSelectedIds((current) =>
            checked
                ? [...new Set([...current, id])]
                : current.filter((selectedId) => selectedId !== id),
        );
    };

    const toggleAllVisible = (checked: boolean) => {
        const visibleIds = selectableCandidates.map((candidate) => candidate.id);
        setSelectedIds((current) =>
            checked
                ? [...new Set([...current, ...visibleIds])]
                : current.filter((id) => !visibleIds.includes(id)),
        );
    };

    const dragLabelFor = (ids: string[]): string => {
        if (ids.length === 1) {
            const dragged = allCandidates.find(
                (candidate) => candidate.id === ids[0],
            );
            return dragged?.name ?? "1 organization";
        }
        return `${ids.length} ${activeTab === "org" ? "organizations" : "groups"}`;
    };

    const handleDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        candidateId: string,
    ) => {
        const ids = selectedIds.includes(candidateId)
            ? selectedIds
            : [candidateId];
        setDraggingIds(ids);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", ids.join(","));

        // The label has to be written straight to the DOM: state updates land
        // after the browser has already snapshotted the drag image.
        if (dragPreviewLabelRef.current && dragPreviewRef.current) {
            dragPreviewLabelRef.current.textContent = dragLabelFor(ids);
            event.dataTransfer.setDragImage(dragPreviewRef.current, 16, 20);
        }
    };

    const placeEntities = (parent: ParentOrgNode) => {
        // Nothing to place, and a row can never become its own parent.
        if (draggingIds.length === 0 || draggingIds.includes(parent.id)) {
            setDraggingIds([]);
            setDragOverParentId(null);
            return;
        }

        const draggedCandidates = allCandidates.filter((candidate) =>
            draggingIds.includes(candidate.id),
        );
        const draggedIdSet = new Set(draggingIds);
        const nextPlacements: HierarchyPlacement[] = [
            ...placements.filter(
                (placement) => !draggedIdSet.has(placement.entityId),
            ),
            ...draggedCandidates.map((candidate) => ({
                entityId: candidate.id,
                entityType: candidate.type,
                parentId: parent.id,
                parentName: parent.code
                    ? `${parent.code} - ${parent.name}`
                    : parent.name,
            })),
        ];

        setHierarchy({ placements: nextPlacements });
        setExpandedNodeIds((current) =>
            current.includes(parent.id) ? current : [...current, parent.id],
        );
        setSelectedIds([]);
        setDraggingIds([]);
        setDragOverParentId(null);
    };

    const removePlacement = (entityId: string) => {
        setHierarchy({
            placements: placements.filter(
                (placement) => placement.entityId !== entityId,
            ),
        });
    };

    const selectParent = (parent: ParentOrgNode) => {
        // Placements hang off the parent they were dropped under, so switching
        // to a different parent starts the placement over.
        const parentChanged = selectedParentId !== parent.id;
        setHierarchy({
            parentQuery: parent.name,
            selectedParentId: parent.id,
            ...(parentChanged ? { placements: [] } : {}),
        });
        if (parentChanged) setSelectedIds([]);
        setExpandedNodeIds([parent.id]);
        setSuggestionsOpen(false);
    };

    const clearParent = () => {
        setHierarchy({ ...emptyCreateOrgGrpHierarchy });
        setSelectedIds([]);
        setExpandedNodeIds([]);
        setSuggestionsOpen(false);
    };

    const toggleNode = (nodeId: string) =>
        setExpandedNodeIds((current) =>
            current.includes(nodeId)
                ? current.filter((id) => id !== nodeId)
                : [...current, nodeId],
        );

    const placedUnder = (nodeId: string): HierarchyCandidate[] =>
        placements
            .filter((placement) => placement.parentId === nodeId)
            .map((placement) =>
                allCandidates.find(
                    (candidate) => candidate.id === placement.entityId,
                ),
            )
            .filter((candidate): candidate is HierarchyCandidate =>
                Boolean(candidate),
            );

    // A placed row is itself a drop target, so orgs/groups can nest under the
    // ones already dropped in this session.
    const renderPlacedNode = (
        child: HierarchyCandidate,
        depth: number,
    ): React.ReactNode => {
        const nested = placedUnder(child.id);
        const expanded = expandedNodeIds.includes(child.id);

        return (
            <div className="hierarchy-tree-branch" key={child.id} role="treeitem">
                <div
                    className={`hierarchy-tree-row placed${
                        dragOverParentId === child.id ? " drag-over" : ""
                    }`}
                    style={{ paddingLeft: `${depth * 28}px` }}
                    draggable
                    onDragStart={(event) => handleDragStart(event, child.id)}
                    onDragEnd={() => {
                        setDraggingIds([]);
                        setDragOverParentId(null);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setDragOverParentId(child.id);
                    }}
                    onDragLeave={() => setDragOverParentId(null)}
                    onDrop={(event) => {
                        event.preventDefault();
                        placeEntities({
                            id: child.id,
                            code: "",
                            name: child.name,
                        });
                    }}
                >
                    <Button
                        variant="secondary"
                        className="hierarchy-tree-toggle"
                        aria-label={expanded ? "Collapse" : "Expand"}
                        aria-expanded={expanded}
                        onClick={() => toggleNode(child.id)}
                    >
                        {expanded ? <BsChevronDown /> : <BsChevronRight />}
                    </Button>
                    <span className="hierarchy-tree-icon">
                        {child.type === "org" ? <OrganizationIcon /> : <GroupIcon />}
                    </span>
                    <span className="hierarchy-tree-label">(New) {child.name}</span>
                    <Button
                        variant="secondary"
                        className="hierarchy-unplace"
                        aria-label={`Remove ${child.name} placement`}
                        onClick={() => removePlacement(child.id)}
                    >
                        <CloseIcon />
                    </Button>
                    <BsGripVertical className="hierarchy-grip" />
                </div>

                {expanded &&
                    nested.map((grandChild) =>
                        renderPlacedNode(grandChild, depth + 1),
                    )}
            </div>
        );
    };

    const renderNode = (node: ParentOrgNode, depth: number): React.ReactNode => {
        const childNodes = node.children ?? [];
        const placedChildren = placedUnder(node.id);
        const hasChildren = childNodes.length > 0 || placedChildren.length > 0;
        const expanded = expandedNodeIds.includes(node.id);

        return (
            <div className="hierarchy-tree-branch" key={node.id} role="treeitem">
                <div
                    className={`hierarchy-tree-row${
                        dragOverParentId === node.id ? " drag-over" : ""
                    }`}
                    style={{ paddingLeft: `${depth * 28}px` }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setDragOverParentId(node.id);
                    }}
                    onDragLeave={() => setDragOverParentId(null)}
                    onDrop={(event) => {
                        event.preventDefault();
                        placeEntities(node);
                    }}
                >
                    {hasChildren ? (
                        <Button
                            variant="secondary"
                            className="hierarchy-tree-toggle"
                            aria-label={expanded ? "Collapse" : "Expand"}
                            aria-expanded={expanded}
                            onClick={() => toggleNode(node.id)}
                        >
                            {expanded ? <BsChevronDown /> : <BsChevronRight />}
                        </Button>
                    ) : (
                        <span className="hierarchy-tree-toggle-spacer" />
                    )}
                    <span className="hierarchy-tree-icon">
                        <OrganizationIcon />
                    </span>
                    <span className="hierarchy-tree-label">
                        {node.code} - {node.name}
                    </span>
                </div>

                {expanded && (
                    <>
                        {placedChildren.map((child) =>
                            renderPlacedNode(child, depth + 1),
                        )}
                        {childNodes.map((child) => renderNode(child, depth + 1))}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="hierarchy-form">
            <div className="hierarchy-toolbar">
                <p>Search for the parent organization, then drag and drop into place</p>
                <div className="hierarchy-progress">
                    <span>
                        {placedOrgCount} / {orgs.length} orgs
                        <span aria-hidden="true"> · </span>
                        {placedGroupCount} / {groups.length} groups
                    </span>
                    <Button
                        variant="secondary"
                        className="hierarchy-reset"
                        disabled={placements.length === 0}
                        onClick={() => {
                            setHierarchy({ placements: [] });
                            setSelectedIds([]);
                        }}
                    >
                        Reset placements
                    </Button>
                </div>
            </div>

            <div className="hierarchy-workspace">
                <aside
                    className={`hierarchy-source${
                        draggingIds.length > 0 ? " dragging" : ""
                    }`}
                >
                    <div className="hierarchy-tabs">
                        <Button
                            variant="secondary"
                            className={activeTab === "org" ? "active" : ""}
                            onClick={() => setTab("org")}
                        >
                            Orgs ({orgs.length})
                        </Button>
                        <Button
                            variant="secondary"
                            className={activeTab === "group" ? "active" : ""}
                            onClick={() => setTab("group")}
                        >
                            Groups ({groups.length})
                        </Button>
                    </div>

                    {selectableCandidates.length > 0 && (
                        <div className="hierarchy-select-row">
                            <div className="hierarchy-select-all">
                                <CustomCheckbox
                                    id={`hierarchy-select-all-${activeTab}`}
                                    checked={allVisibleSelected}
                                    onChange={toggleAllVisible}
                                />
                                <label htmlFor={`hierarchy-select-all-${activeTab}`}>
                                    Select all
                                </label>
                            </div>
                            <Button
                                variant="secondary"
                                className="hierarchy-clear"
                                disabled={selectedIds.length === 0}
                                onClick={() => setSelectedIds([])}
                            >
                                Clear
                            </Button>
                        </div>
                    )}

                    <div className="hierarchy-entity-list">
                        {visibleCandidates.length === 0 ? (
                            <p className="hierarchy-source-empty">
                                No {activeTab === "org" ? "organizations" : "groups"} to
                                place.
                            </p>
                        ) : (
                            visibleCandidates.map((candidate) => {
                                const placement = placementByEntity.get(candidate.id);
                                return (
                                    <div
                                        key={candidate.id}
                                        className={`hierarchy-entity-card${
                                            selectedIds.includes(candidate.id)
                                                ? " selected"
                                                : ""
                                        }${placement ? " placed" : ""}`}
                                        draggable
                                        onDragStart={(event) =>
                                            handleDragStart(event, candidate.id)
                                        }
                                        onDragEnd={() => {
                                            setDraggingIds([]);
                                            setDragOverParentId(null);
                                        }}
                                    >
                                        {!placement && (
                                            <>
                                                <CustomCheckbox
                                                    id={`hierarchy-entity-${candidate.id}`}
                                                    checked={selectedIds.includes(
                                                        candidate.id,
                                                    )}
                                                    onChange={(checked) =>
                                                        toggleCandidate(
                                                            candidate.id,
                                                            checked,
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="visually-hidden"
                                                    htmlFor={`hierarchy-entity-${candidate.id}`}
                                                >
                                                    Select {candidate.name}
                                                </label>
                                            </>
                                        )}
                                        <span className="hierarchy-entity-icon">
                                            {candidate.type === "org" ? (
                                                <OrganizationIcon />
                                            ) : (
                                                <GroupIcon />
                                            )}
                                            {placement && (
                                                <BsCheckCircleFill className="hierarchy-entity-check" />
                                            )}
                                        </span>
                                        <span className="hierarchy-entity-copy">
                                            <strong>{candidate.name}</strong>
                                            <small>
                                                {placement
                                                    ? placement.parentName
                                                    : "Not placed"}
                                            </small>
                                        </span>
                                        <BsGripVertical className="hierarchy-grip" />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                <section className="hierarchy-destination">
                    <div
                        className="hierarchy-search-field"
                        ref={searchRef}
                        onMouseDown={() => {
                            if (parentQuery.trim() !== "") setSuggestionsOpen(true);
                        }}
                    >
                        <SearchBar
                            overlayRequired={false}
                            closeIcon
                            type="md"
                            customClass="hierarchy-search"
                            placeholder="Search for the parent organization"
                            value={parentQuery}
                            onChange={(event) => {
                                const nextQuery = event.target.value;
                                if (nextQuery.trim() === "") {
                                    clearParent();
                                    return;
                                }
                                setHierarchy({ parentQuery: nextQuery });
                                setSuggestionsOpen(true);
                            }}
                            onEnter={() => {
                                if (suggestions.length > 0) selectParent(suggestions[0]);
                            }}
                        />

                        {suggestionsOpen && parentQuery.trim() !== "" && (
                            <ul
                                className="hierarchy-suggestions"
                                id="hierarchy-parent-suggestions"
                                role="listbox"
                            >
                                {suggestions.length === 0 ? (
                                    <li className="hierarchy-suggestion-empty">
                                        No matching parent organizations
                                    </li>
                                ) : (
                                    suggestions.map((parent) => (
                                        <li key={parent.id}>
                                            <Button
                                                variant="secondary"
                                                role="option"
                                                aria-selected={parent.id === selectedParentId}
                                                className={`hierarchy-suggestion${
                                                    parent.id === selectedParentId
                                                        ? " selected"
                                                        : ""
                                                }`}
                                                onClick={() => selectParent(parent)}
                                            >
                                                <strong>{parent.primary}</strong>
                                                {parent.rest}
                                            </Button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    {!selectedParent ? (
                        <div className="hierarchy-empty-state">
                            <span className="hierarchy-empty-icon">
                                <BsSearch />
                            </span>
                            <h3>Search for a parent org to get started</h3>
                            <p>
                                Select a parent organization, then drag and drop the new
                                org/group
                            </p>
                        </div>
                    ) : (
                        <div className="hierarchy-tree" role="tree">
                            {renderNode(selectedParent, 0)}
                        </div>
                    )}
                </section>
            </div>

            {/* Kept off-screen so the browser can snapshot it as the drag image. */}
            <div
                className="hierarchy-drag-preview"
                ref={dragPreviewRef}
                aria-hidden="true"
            >
                <span className="hierarchy-entity-icon">
                    {activeTab === "org" ? <OrganizationIcon /> : <GroupIcon />}
                </span>
                <span ref={dragPreviewLabelRef} />
            </div>
        </div>
    );
};
