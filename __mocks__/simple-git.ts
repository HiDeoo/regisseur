const initialCurrentBranch = 'main'
const initialIsClean = true
const initialIsRepo = true

let currentBranch = initialCurrentBranch
let isClean = initialIsClean
let isRepo = initialIsRepo

export const simpleGit = () => {
  return {
    mockBranch: (branch: string) => {
      currentBranch = branch
    },
    mockClean: (clean: boolean) => {
      isClean = clean
    },
    mockRepo: (repo: boolean) => {
      isRepo = repo
    },
    resetMocks: () => {
      currentBranch = initialCurrentBranch
      isClean = initialIsClean
      isRepo = initialIsRepo
    },
    status: () => {
      if (isRepo) {
        return Promise.resolve({ current: currentBranch, isClean: () => isClean })
      }

      throw new Error('not a git repository')
    },
  }
}

declare module 'simple-git' {
  export interface SimpleGit {
    mockBranch: (branch: string) => void
    mockClean: (clean: boolean) => void
    mockRepo: (repo: boolean) => void
    resetMocks: () => void
  }
}
