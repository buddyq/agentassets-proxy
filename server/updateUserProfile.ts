// Storage method implementation - add to server/storage.ts

async updateUserProfile(id: string, profile: Partial<{
  name?: string;
  email?: string;
  phone?: string;
  brokerage?: string;
  teamName?: string;
  address?: string;
  logo?: string | null;
  profileImageUrl?: string | null;
  socialMedia?: Record<string, string>;
}>): Promise<User> {
  const updateData: any = {};
  if (profile.name !== undefined) updateData.name = profile.name;
  if (profile.email !== undefined) updateData.email = profile.email;
  if (profile.phone !== undefined) updateData.phone = profile.phone;
  if (profile.brokerage !== undefined) updateData.brokerage = profile.brokerage;
  if (profile.teamName !== undefined) updateData.teamName = profile.teamName;
  if (profile.address !== undefined) updateData.address = profile.address;
  if (profile.logo !== undefined) updateData.logo = profile.logo;
  if (profile.profileImageUrl !== undefined) updateData.profileImageUrl = profile.profileImageUrl;
  if (profile.socialMedia !== undefined) updateData.socialMedia = profile.socialMedia;
  updateData.updatedAt = new Date();

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();
  return user;
}
