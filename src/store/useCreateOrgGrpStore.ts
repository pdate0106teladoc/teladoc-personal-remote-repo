import { create } from "zustand";
import {
  CreateOrgGrpBasicInfo,
  CreateOrgGrpDetails,
  CreateOrgGrpEntity,
  CreateOrgGrpHierarchy,
  CreateOrgGrpOpportunityStep,
} from "@/components/CreateOrgGrp/types";

export type CreateOrgGrpState = {
  details: CreateOrgGrpDetails;
  opportunity: CreateOrgGrpOpportunityStep;
  basicInfo: CreateOrgGrpBasicInfo;
  hierarchy: CreateOrgGrpHierarchy;
  orgs: CreateOrgGrpEntity[];
  groups: CreateOrgGrpEntity[];
  // Account linkage is completed one org at a time.
  accountLinkageIndex: number;
  setDetails: (details: Partial<CreateOrgGrpDetails>) => void;
  setOpportunity: (opportunity: Partial<CreateOrgGrpOpportunityStep>) => void;
  setBasicInfo: (basicInfo: Partial<CreateOrgGrpBasicInfo>) => void;
  setHierarchy: (hierarchy: Partial<CreateOrgGrpHierarchy>) => void;
  setOrgs: (orgs: CreateOrgGrpEntity[]) => void;
  setGroups: (groups: CreateOrgGrpEntity[]) => void;
  setAccountLinkageIndex: (index: number) => void;
  reset: () => void;
};

export const emptyCreateOrgGrpDetails: CreateOrgGrpDetails = {
  taskId: "",
  priority: "",
  launchOption: "",
  launchDate: null,
  workfrontId: "",
  playbookLink: "",
  createTypes: [],
  basicInfoMethod: "",
  files: [],
};

export const emptyCreateOrgGrpOpportunity: CreateOrgGrpOpportunityStep = {
  accountQuery: "",
  opportunityQuery: "",
  results: [],
  selectedOpportunities: [],
};

export const emptyCreateOrgGrpBasicInfo: CreateOrgGrpBasicInfo = {
  bulkFile: null,
  orgRecords: [],
  groupRecords: [],
};

export const emptyCreateOrgGrpHierarchy: CreateOrgGrpHierarchy = {
  parentQuery: "",
  selectedParentId: "",
  placements: [],
};

const initialState = {
  details: { ...emptyCreateOrgGrpDetails },
  opportunity: { ...emptyCreateOrgGrpOpportunity },
  basicInfo: { ...emptyCreateOrgGrpBasicInfo },
  hierarchy: { ...emptyCreateOrgGrpHierarchy },
  orgs: [] as CreateOrgGrpEntity[],
  groups: [] as CreateOrgGrpEntity[],
  accountLinkageIndex: 0,
};

const useCreateOrgGrpStore = create<CreateOrgGrpState>((set) => ({
  ...initialState,

  setDetails: (details) =>
    set((state) => ({
      details: { ...state.details, ...details },
    })),

  setOpportunity: (opportunity) =>
    set((state) => ({
      opportunity: { ...state.opportunity, ...opportunity },
    })),

  setBasicInfo: (basicInfo) =>
    set((state) => ({
      basicInfo: { ...state.basicInfo, ...basicInfo },
    })),

  setHierarchy: (hierarchy) =>
    set((state) => ({
      hierarchy: { ...state.hierarchy, ...hierarchy },
    })),

  setOrgs: (orgs) => set({ orgs }),
  setGroups: (groups) => set({ groups }),
  setAccountLinkageIndex: (accountLinkageIndex) => set({ accountLinkageIndex }),

  reset: () =>
    set({
      details: { ...emptyCreateOrgGrpDetails },
      opportunity: { ...emptyCreateOrgGrpOpportunity },
      basicInfo: { ...emptyCreateOrgGrpBasicInfo },
      hierarchy: { ...emptyCreateOrgGrpHierarchy },
      orgs: [],
      groups: [],
      accountLinkageIndex: 0,
    }),
}));

export default useCreateOrgGrpStore;
