import { apiClient } from './client'
import type {
  Policy,
  PolicyListParams,
  PolicyListResponse,
  CreatePolicyPayload,
  UpdatePolicyPayload,
} from '@/types/policy'

export async function listPolicies(params: PolicyListParams): Promise<PolicyListResponse> {
  const { data } = await apiClient.get<PolicyListResponse>('/policies', { params })
  return data
}

export async function getPolicy(id: string): Promise<Policy> {
  const { data } = await apiClient.get<Policy>(`/policies/${id}`)
  return data
}

export async function createPolicy(payload: CreatePolicyPayload): Promise<Policy> {
  const { data } = await apiClient.post<Policy>('/policies', payload)
  return data
}

export async function updatePolicy(id: string, payload: UpdatePolicyPayload): Promise<Policy> {
  const { data } = await apiClient.patch<Policy>(`/policies/${id}`, payload)
  return data
}

export async function deletePolicy(id: string): Promise<void> {
  await apiClient.delete(`/policies/${id}`)
}
