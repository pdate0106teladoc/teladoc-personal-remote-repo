import { create } from "zustand";
import {
  CreateOrgGrpBasicInfo,
  CreateOrgGrpDetails,
  CreateOrgGrpEntity,
  CreateOrgGrpOpportunityStep,
} from "@/components/CreateOrgGrp/types";

export type CreateOrgGrpState = {
  details: CreateOrgGrpDetails;
  opportunity: CreateOrgGrpOpportunityStep;
  basicInfo: CreateOrgGrpBasicInfo;
  orgs: CreateOrgGrpEntity[];
  groups: CreateOrgGrpEntity[];
  setDetails: (details: Partial<CreateOrgGrpDetails>) => void;
  setOpportunity: (opportunity: Partial<CreateOrgGrpOpportunityStep>) => void;
  setBasicInfo: (basicInfo: Partial<CreateOrgGrpBasicInfo>) => void;
  setOrgs: (orgs: CreateOrgGrpEntity[]) => void;
  setGroups: (groups: CreateOrgGrpEntity[]) => void;
  reset: () => void;
};

export const emptyCreateOrgGrpDetails: CreateOrgGrpDetails = {
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

const initialState = {
  details: { ...emptyCreateOrgGrpDetails },
  opportunity: { ...emptyCreateOrgGrpOpportunity },
  basicInfo: { ...emptyCreateOrgGrpBasicInfo },
  orgs: [] as CreateOrgGrpEntity[],
  groups: [] as CreateOrgGrpEntity[],
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

  setOrgs: (orgs) => set({ orgs }),
  setGroups: (groups) => set({ groups }),

  reset: () =>
    set({
      details: { ...emptyCreateOrgGrpDetails },
      opportunity: { ...emptyCreateOrgGrpOpportunity },
      basicInfo: { ...emptyCreateOrgGrpBasicInfo },
      orgs: [],
      groups: [],
    }),
}));

export default useCreateOrgGrpStore;
